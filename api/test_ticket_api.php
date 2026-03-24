<?php
// Test file to check what's being output
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting test...\n";

require_once 'config.php';

echo "Config loaded successfully\n";

// Test JSON response
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Test successful']);
?>
