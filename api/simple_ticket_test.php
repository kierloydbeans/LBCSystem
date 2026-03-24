<?php
// Simple test to isolate the issue
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Start output buffering
ob_start();

header('Content-Type: application/json');

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Clean any output
        ob_clean();
        
        // Test basic response
        echo json_encode([
            'success' => true, 
            'message' => 'Simple test successful',
            'data' => [
                'received' => 'POST request',
                'token' => $_POST['auth_token'] ?? 'none'
            ]
        ]);
    } catch (Exception $e) {
        ob_clean();
        echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    ob_clean();
    echo json_encode([
        'success' => false, 
        'message' => 'Method not allowed'
    ]);
}
?>
