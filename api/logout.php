<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get user ID from token
        $userId = requireAuth();
        
        // Get token from header
        $token = getBearerToken();
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Remove session from database
        $stmt = $db->prepare('DELETE FROM user_sessions WHERE session_token = :token AND user_id = :user_id');
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        sendJsonResponse(true, 'Logout successful');
        
    } catch (Exception $e) {
        error_log('Logout error: ' . $e->getMessage());
        sendJsonResponse(false, 'An error occurred during logout', null, 500);
    }
    
} else {
    // Method not allowed
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
