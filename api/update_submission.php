<?php
/**
 * Update Submission Status API
 * Updates ticket purchase submission status (confirm/reject)
 */

require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Start output buffering
ob_start();

// Handle POST request for updating submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $jsonInput = file_get_contents('php://input');
        $data = json_decode($jsonInput, true);
        
        if (!$data) {
            ob_clean();
            sendJsonResponse(false, 'Invalid JSON data', null, 400);
        }
        
        // Validate required fields
        if (empty($data['submission_id']) || empty($data['status'])) {
            ob_clean();
            sendJsonResponse(false, 'Missing required fields', null, 400);
        }
        
        // Check authentication
        $authToken = $data['auth_token'] ?? '';
        if (empty($authToken)) {
            ob_clean();
            sendJsonResponse(false, 'Authentication required', null, 401);
        }
        
        // Validate user
        $userId = validateToken($authToken);
        if (!$userId) {
            ob_clean();
            sendJsonResponse(false, 'Invalid authentication token', null, 401);
        }
        
        // Validate status
        $validStatuses = ['pending', 'confirmed', 'rejected'];
        if (!in_array($data['status'], $validStatuses)) {
            ob_clean();
            sendJsonResponse(false, 'Invalid status', null, 400);
        }
        
        $submissionId = (int)$data['submission_id'];
        $status = $data['status'];
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Check if submission exists
        $checkQuery = 'SELECT id, status FROM ticket_purchases WHERE id = :submission_id';
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':submission_id', $submissionId, PDO::PARAM_INT);
        $checkStmt->execute();
        $existingSubmission = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingSubmission) {
            ob_clean();
            sendJsonResponse(false, 'Submission not found', null, 404);
        }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // Update submission status
            $updateQuery = '
                UPDATE ticket_purchases 
                SET status = :status, updated_at = NOW()
                WHERE id = :submission_id
            ';
            
            $stmt = $db->prepare($updateQuery);
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':submission_id', $submissionId, PDO::PARAM_INT);
            $stmt->execute();
            
            // If confirming, generate tickets
            if ($status === 'confirmed') {
                // Get submission details
                $submissionQuery = '
                    SELECT tp.*, e.title as event_title
                    FROM ticket_purchases tp
                    LEFT JOIN events e ON tp.event_id = e.id
                    WHERE tp.id = :submission_id
                ';
                
                $submissionStmt = $db->prepare($submissionQuery);
                $submissionStmt->bindParam(':submission_id', $submissionId, PDO::PARAM_INT);
                $submissionStmt->execute();
                $submission = $submissionStmt->fetch(PDO::FETCH_ASSOC);
                
                // Generate tickets
                for ($i = 0; $i < $submission['quantity']; $i++) {
                    $ticketNumber = generateTicketNumber($submission['id'], $i + 1);
                    
                    $ticketQuery = '
                        INSERT INTO tickets (
                            purchase_id, ticket_number, event_id, user_id,
                            ticket_holder_name, ticket_holder_phone,
                            status, issued_date, created_at, updated_at
                        ) VALUES (
                            :purchase_id, :ticket_number, :event_id, :user_id,
                            :ticket_holder_name, :ticket_holder_phone,
                            :status, NOW(), NOW(), NOW()
                        )
                    ';
                    
                    $ticketStmt = $db->prepare($ticketQuery);
                    $ticketStmt->bindParam(':purchase_id', $submissionId, PDO::PARAM_INT);
                    $ticketStmt->bindParam(':ticket_number', $ticketNumber, PDO::PARAM_STR);
                    $ticketStmt->bindParam(':event_id', $submission['event_id'], PDO::PARAM_INT);
                    $ticketStmt->bindParam(':user_id', $submission['user_id'], PDO::PARAM_INT);
                    $ticketStmt->bindParam(':ticket_holder_name', $submission['account_name'], PDO::PARAM_STR);
                    $ticketStmt->bindParam(':ticket_holder_phone', $submission['phone_number'], PDO::PARAM_STR);
                    $ticketStmt->bindParam(':status', $ticketStatus = 'active', PDO::PARAM_STR);
                    $ticketStmt->execute();
                }
            }
            
            // Commit transaction
            $db->commit();
            
            // Clean buffer and send response
            ob_clean();
            sendJsonResponse(true, "Submission {$status} successfully", [
                'submission_id' => $submissionId,
                'status' => $status
            ]);
            
        } catch (Exception $e) {
            // Rollback transaction
            $db->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'An error occurred while updating submission', null, 500);
    }
    
} else {
    // Method not allowed
    ob_clean();
    sendJsonResponse(false, 'Method not allowed', null, 405);
}

/**
 * Generate unique ticket number
 */
function generateTicketNumber($purchaseId, $ticketNumber) {
    return 'TCKT' . str_pad($purchaseId, 6, '0', STR_PAD_LEFT) . '-' . str_pad($ticketNumber, 3, '0', STR_PAD_LEFT);
}
?>
