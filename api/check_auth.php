<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get user ID from token
        $userId = requireAuth();
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Get user data
        $stmt = $db->prepare('
            SELECT id, email, first_name, last_name, phone, date_of_birth, email_verified, last_login, created_at 
            FROM users 
            WHERE id = :user_id AND is_active = 1
        ');
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if (!$user) {
            sendJsonResponse(false, 'User not found', null, 404);
        }
        
        sendJsonResponse(true, 'User authenticated', [
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        error_log('Auth check error: ' . $e->getMessage());
        sendJsonResponse(false, 'Authentication check failed', null, 500);
    }
    
} else {
    // Method not allowed
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
