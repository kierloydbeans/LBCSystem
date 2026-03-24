<?php
/**
 * Admin Submissions API
 * Retrieves ticket purchase submissions for admin panel
 */

require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Start output buffering
ob_start();

// Handle GET request for submissions
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check authentication (simplified for demo)
        $authToken = $_GET['auth_token'] ?? '';
        if (empty($authToken)) {
            ob_clean();
            sendJsonResponse(false, 'Authentication required', null, 401);
        }
        
        // Validate user (simplified - in production, check if user is admin)
        $userId = validateToken($authToken);
        if (!$userId) {
            ob_clean();
            sendJsonResponse(false, 'Invalid authentication token', null, 401);
        }
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Query submissions with event and user details
        $query = '
            SELECT 
                tp.id,
                tp.user_id,
                tp.event_id,
                tp.account_name,
                tp.phone_number,
                tp.quantity,
                tp.unit_price,
                tp.total_amount,
                tp.payment_method,
                tp.receipt_image_url,
                tp.notes,
                tp.status,
                tp.purchase_date,
                tp.created_at,
                tp.updated_at,
                e.title as event_title,
                e.event_date,
                u.first_name,
                u.last_name,
                u.email
            FROM ticket_purchases tp
            LEFT JOIN events e ON tp.event_id = e.id
            LEFT JOIN users u ON tp.user_id = u.id
            ORDER BY tp.purchase_date DESC
        ';
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process submissions data
        foreach ($submissions as &$submission) {
            // Format purchase date
            $purchaseDate = new DateTime($submission['purchase_date']);
            $submission['formatted_date'] = $purchaseDate->format('F j, Y');
            $submission['formatted_time'] = $purchaseDate->format('g:i A');
            
            // Add customer full name
            $submission['customer_name'] = trim(($submission['first_name'] ?? '') . ' ' . ($submission['last_name'] ?? ''));
            if (empty($submission['customer_name'])) {
                $submission['customer_name'] = $submission['account_name'];
            }
        }
        
        // Clean buffer and send response
        ob_clean();
        sendJsonResponse(true, 'Submissions retrieved successfully', [
            'submissions' => $submissions,
            'total' => count($submissions)
        ]);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'An error occurred while fetching submissions', null, 500);
    }
    
} else {
    // Method not allowed
    ob_clean();
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
