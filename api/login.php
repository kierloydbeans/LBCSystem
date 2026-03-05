<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);
    
    if (!$data) {
        sendJsonResponse(false, 'Invalid JSON data', null, 400);
    }
    
    // Validate required fields
    if (!isset($data['email']) || !isset($data['password'])) {
        sendJsonResponse(false, 'Email and password are required', null, 400);
    }
    
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $rememberMe = isset($data['remember_me']) ? (bool)$data['remember_me'] : false;
    
    // Validate email format
    if (!validateEmail($email)) {
        sendJsonResponse(false, 'Invalid email format', null, 400);
    }
    
    // Validate password length
    if (strlen($password) < 1) {
        sendJsonResponse(false, 'Password is required', null, 400);
    }
    
    try {
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Prepare statement to prevent SQL injection
        $stmt = $db->prepare('SELECT id, email, password, first_name, last_name, is_active, email_verified FROM users WHERE email = :email');
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if (!$user) {
            sendJsonResponse(false, 'Invalid email or password', null, 401);
        }
        
        // Check if user is active
        if (!$user['is_active']) {
            sendJsonResponse(false, 'Account is deactivated. Please contact support.', null, 401);
        }
        
        // Verify password
        if (!verifyPassword($password, $user['password'])) {
            sendJsonResponse(false, 'Invalid email or password', null, 401);
        }
        
        // Generate token
        $token = generateToken($user['id']);
        
        // Store session in database
        $expiresAt = date('Y-m-d H:i:s', time() + ($rememberMe ? SESSION_DURATION * 30 : SESSION_DURATION)); // 30 days if remember me
        
        $sessionStmt = $db->prepare('INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (:user_id, :token, :expires_at)');
        $sessionStmt->bindParam(':user_id', $user['id']);
        $sessionStmt->bindParam(':token', $token);
        $sessionStmt->bindParam(':expires_at', $expiresAt);
        $sessionStmt->execute();
        
        // Update last login
        $updateStmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = :id');
        $updateStmt->bindParam(':id', $user['id']);
        $updateStmt->execute();
        
        // Prepare user data for response (excluding password)
        $userData = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email_verified' => (bool)$user['email_verified'],
            'last_login' => date('Y-m-d H:i:s')
        ];
        
        // Send successful response
        sendJsonResponse(true, 'Login successful', [
            'user' => $userData,
            'token' => $token,
            'expires_at' => $expiresAt
        ]);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        sendJsonResponse(false, 'An error occurred during login', null, 500);
    }
    
} else {
    // Method not allowed
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
