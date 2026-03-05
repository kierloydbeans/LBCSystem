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
    $requiredFields = ['email', 'password', 'first_name', 'last_name'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            sendJsonResponse(false, ucfirst(str_replace('_', ' ', $field)) . ' is required', null, 400);
        }
    }
    
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $firstName = sanitizeInput($data['first_name']);
    $lastName = sanitizeInput($data['last_name']);
    $phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;
    $dateOfBirth = isset($data['date_of_birth']) ? sanitizeInput($data['date_of_birth']) : null;
    
    // Validate email format
    if (!validateEmail($email)) {
        sendJsonResponse(false, 'Invalid email format', null, 400);
    }
    
    // Validate password strength
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        sendJsonResponse(false, 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long', null, 400);
    }
    
    // Validate password contains at least one number and one letter
    if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d).+$/', $password)) {
        sendJsonResponse(false, 'Password must contain at least one letter and one number', null, 400);
    }
    
    // Validate phone number if provided
    if ($phone && !preg_match('/^[\d\s\-\+\(\)]+$/', $phone)) {
        sendJsonResponse(false, 'Invalid phone number format', null, 400);
    }
    
    // Validate date of birth if provided
    if ($dateOfBirth) {
        $dob = DateTime::createFromFormat('Y-m-d', $dateOfBirth);
        if (!$dob || $dob->format('Y-m-d') !== $dateOfBirth) {
            sendJsonResponse(false, 'Invalid date of birth format. Use YYYY-MM-DD', null, 400);
        }
        
        // Check if user is at least 13 years old
        $minAge = new DateTime('-13 years');
        if ($dob > $minAge) {
            sendJsonResponse(false, 'You must be at least 13 years old to register', null, 400);
        }
    }
    
    try {
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Check if email already exists
        $checkStmt = $db->prepare('SELECT id FROM users WHERE email = :email');
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            sendJsonResponse(false, 'Email address already registered', null, 409);
        }
        
        // Hash password
        $hashedPassword = hashPassword($password);
        
        // Insert new user
        $insertStmt = $db->prepare('
            INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, is_active, email_verified) 
            VALUES (:email, :password, :first_name, :last_name, :phone, :date_of_birth, 1, 0)
        ');
        
        $insertStmt->bindParam(':email', $email);
        $insertStmt->bindParam(':password', $hashedPassword);
        $insertStmt->bindParam(':first_name', $firstName);
        $insertStmt->bindParam(':last_name', $lastName);
        $insertStmt->bindParam(':phone', $phone);
        $insertStmt->bindParam(':date_of_birth', $dateOfBirth);
        
        $insertStmt->execute();
        
        $userId = $db->lastInsertId();
        
        // Generate token for automatic login
        $token = generateToken($userId);
        
        // Store session in database
        $expiresAt = date('Y-m-d H:i:s', time() + SESSION_DURATION);
        
        $sessionStmt = $db->prepare('INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (:user_id, :token, :expires_at)');
        $sessionStmt->bindParam(':user_id', $userId);
        $sessionStmt->bindParam(':token', $token);
        $sessionStmt->bindParam(':expires_at', $expiresAt);
        $sessionStmt->execute();
        
        // Prepare user data for response
        $userData = [
            'id' => $userId,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $phone,
            'date_of_birth' => $dateOfBirth,
            'email_verified' => false,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Send successful response
        sendJsonResponse(true, 'Registration successful', [
            'user' => $userData,
            'token' => $token,
            'expires_at' => $expiresAt,
            'message' => 'Welcome to Lost Boys Club! Please check your email to verify your account.'
        ]);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        sendJsonResponse(false, 'An error occurred during registration', null, 500);
    }
    
} else {
    // Method not allowed
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
