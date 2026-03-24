<?php
/**
 * Ticket Purchase API
 * Handles ticket purchase submissions with receipt upload
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to output

// Start output buffering to prevent HTML mixing with JSON
ob_start();

require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Handle POST request for ticket purchase
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check authentication
        $authToken = $_POST['auth_token'] ?? '';
        if (empty($authToken)) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Authentication required', null, 401);
        }
        
        // Validate user
        $userId = validateToken($authToken);
        if (!$userId) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Invalid authentication token', null, 401);
        }
        
        // Validate required fields
        $requiredFields = ['event_id', 'account_name', 'phone_number', 'quantity', 'unit_price', 'total_amount', 'payment_method'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                ob_clean(); // Clean any output buffer
                sendJsonResponse(false, "Missing required field: $field", null, 400);
            }
        }
        
        // Validate file upload
        if (!isset($_FILES['receipt_image']) || $_FILES['receipt_image']['error'] !== UPLOAD_ERR_OK) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Receipt image is required', null, 400);
        }
        
        // Validate event exists and has available tickets
        $eventId = (int)$_POST['event_id'];
        $quantity = (int)$_POST['quantity'];
        $unitPrice = (float)$_POST['unit_price'];
        $totalAmount = (float)$_POST['total_amount'];
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Check event availability
        $eventQuery = '
            SELECT id, title, available_tickets, base_price, is_active 
            FROM events 
            WHERE id = :event_id AND is_active = 1
        ';
        
        $stmt = $db->prepare($eventQuery);
        $stmt->bindParam(':event_id', $eventId, PDO::PARAM_INT);
        $stmt->execute();
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$event) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Event not found or not available', null, 404);
        }
        
        // Check if enough tickets are available
        if ($event['available_tickets'] < $quantity) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Not enough tickets available', null, 400);
        }
        
        // Validate price matches
        if (abs($event['base_price'] - $unitPrice) > 0.01) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Price mismatch detected', null, 400);
        }
        
        // Validate total amount
        $expectedTotal = $quantity * $unitPrice;
        if (abs($expectedTotal - $totalAmount) > 0.01) {
            ob_clean(); // Clean any output buffer
            sendJsonResponse(false, 'Total amount mismatch detected', null, 400);
        }
        
        // Handle file upload
        $receiptFile = $_FILES['receipt_image'];
        $receiptPath = '';
        
        if ($receiptFile['error'] === UPLOAD_ERR_OK) {
            // Create upload directory if it doesn't exist
            $uploadDir = '../assets/receipts/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generate unique filename
            $fileExtension = pathinfo($receiptFile['name'], PATHINFO_EXTENSION);
            $fileName = 'receipt_' . $userId . '_' . $eventId . '_' . time() . '.' . $fileExtension;
            $receiptPath = $uploadDir . $fileName;
            
            // Move uploaded file
            if (!move_uploaded_file($receiptFile['tmp_name'], $receiptPath)) {
                ob_clean(); // Clean any output buffer
                sendJsonResponse(false, 'Failed to upload receipt image', null, 500);
            }
        }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // Insert ticket purchase record
            $purchaseQuery = '
                INSERT INTO ticket_purchases (
                    user_id, event_id, quantity, unit_price, total_amount,
                    payment_method, account_name, phone_number, receipt_image_url,
                    notes, status, created_at, updated_at
                ) VALUES (
                    :user_id, :event_id, :quantity, :unit_price, :total_amount,
                    :payment_method, :account_name, :phone_number, :receipt_image_url,
                    :notes, :status, NOW(), NOW()
                )
            ';
            
            $stmt = $db->prepare($purchaseQuery);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':event_id', $eventId, PDO::PARAM_INT);
            $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
            $stmt->bindParam(':unit_price', $unitPrice, PDO::PARAM_STR);
            $stmt->bindParam(':total_amount', $totalAmount, PDO::PARAM_STR);
            $stmt->bindParam(':payment_method', $_POST['payment_method'], PDO::PARAM_STR);
            $stmt->bindParam(':account_name', $_POST['account_name'], PDO::PARAM_STR);
            $stmt->bindParam(':phone_number', $_POST['phone_number'], PDO::PARAM_STR);
            $stmt->bindParam(':receipt_image_url', $fileName, PDO::PARAM_STR);
            
            $notes = $_POST['notes'] ?? '';
            $stmt->bindParam(':notes', $notes, PDO::PARAM_STR);
            
            $status = 'pending';
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->execute();
            
            $purchaseId = $db->lastInsertId();
            
            // Update event available tickets
            $updateEventQuery = '
                UPDATE events 
                SET available_tickets = available_tickets - :quantity 
                WHERE id = :event_id
            ';
            
            $stmt = $db->prepare($updateEventQuery);
            $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
            $stmt->bindParam(':event_id', $eventId, PDO::PARAM_INT);
            $stmt->execute();
            
            // Commit transaction
            $db->commit();
            
            // Send success response
            ob_clean(); // Clean any output buffer
            sendJsonResponse(true, 'Ticket purchase submitted successfully', [
                'purchase_id' => $purchaseId,
                'event_title' => $event['title'],
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'status' => 'pending'
            ]);
            
        } catch (Exception $e) {
            // Rollback transaction
            $db->rollBack();
            
            // Delete uploaded file if transaction failed
            if ($receiptPath && file_exists($receiptPath)) {
                unlink($receiptPath);
            }
            
            throw $e;
        }
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        ob_clean(); // Clean any output buffer
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        ob_clean(); // Clean any output buffer
        sendJsonResponse(false, 'An error occurred while processing your request', null, 500);
    }
    
} else {
    // Method not allowed
    ob_clean(); // Clean any output buffer
    sendJsonResponse(false, 'Method not allowed', null, 405);
}

/**
 * Validate JWT token and return user ID
 */
function validateToken($token) {
    try {
        $payload = validateJWT($token);
        return $payload['user_id'] ?? null;
    } catch (Exception $e) {
        return null;
    }
}
?>
