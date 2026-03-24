<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'lost_boys_club');
define('DB_USER', 'root');
define('DB_PASS', '');

// Security settings
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');
define('PASSWORD_MIN_LENGTH', 8);
define('SESSION_DURATION', 86400); // 24 hours in seconds

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Custom error handler
function handleError($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $errstr
    ]);
    exit();
}

set_error_handler('handleError');

// Database connection class
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}

// Utility functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function generateToken($userId) {
    $payload = [
        'user_id' => $userId,
        'exp' => time() + SESSION_DURATION,
        'iat' => time()
    ];
    
    // Simple JWT-like token (in production, use a proper JWT library)
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyToken($token) {
    if (empty($token)) {
        return false;
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $signature = $parts[2];
    
    $payloadData = json_decode($payload, true);
    if (!$payloadData || $payloadData['exp'] < time()) {
        return false;
    }
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlExpectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    return hash_equals($signature, $base64UrlExpectedSignature) ? $payloadData : false;
}

function validateJWT($token) {
    return verifyToken($token);
}

function sendJsonResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function requireAuth() {
    $token = getBearerToken();
    if (!$token) {
        sendJsonResponse(false, 'Authorization token required', null, 401);
    }
    
    $payload = verifyToken($token);
    if (!$payload) {
        sendJsonResponse(false, 'Invalid or expired token', null, 401);
    }
    
    return $payload['user_id'];
}
?>
