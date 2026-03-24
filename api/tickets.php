<?php
/**
 * Tickets API
 * Fetches tickets from the database
 */

require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Start output buffering
ob_start();

// Handle GET request for tickets
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check authentication
        $authToken = $_GET['auth_token'] ?? '';
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
        
        // Get query parameters
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $status = $_GET['status'] ?? '';
        
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Build base query
        $query = '
            SELECT 
                t.id,
                t.purchase_id,
                t.ticket_number,
                t.event_id,
                t.user_id,
                t.ticket_holder_name,
                t.ticket_holder_phone,
                t.status,
                t.issued_date,
                t.created_at,
                t.updated_at,
                e.title as event_title,
                e.event_date,
                e.description as event_description,
                tp.account_name,
                tp.phone_number,
                tp.total_amount,
                tp.purchase_date
            FROM tickets t
            LEFT JOIN events e ON t.event_id = e.id
            LEFT JOIN ticket_purchases tp ON t.purchase_id = tp.id
            WHERE 1=1
        ';
        
        $params = [];
        
        // Add status filter if provided
        if (!empty($status)) {
            $query .= ' AND t.status = :status';
            $params['status'] = $status;
        }
        
        // Add user filter (only show user's own tickets)
        $query .= ' AND t.user_id = :user_id';
        $params['user_id'] = $userId;
        
        // Add ordering
        $query .= ' ORDER BY t.issued_date DESC';
        
        // Add pagination
        $query .= ' LIMIT :limit OFFSET :offset';
        
        $stmt = $db->prepare($query);
        
        // Bind parameters
        if (!empty($status)) {
            $stmt->bindParam(':status', $params['status'], PDO::PARAM_STR);
        }
        $stmt->bindParam(':user_id', $params['user_id'], PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process tickets data
        foreach ($tickets as &$ticket) {
            // Format dates
            $issuedDate = new DateTime($ticket['issued_date']);
            $ticket['formatted_issued_date'] = $issuedDate->format('F j, Y');
            $ticket['formatted_issued_time'] = $issuedDate->format('g:i A');
            
            $eventDate = new DateTime($ticket['event_date']);
            $ticket['formatted_event_date'] = $eventDate->format('F j, Y');
            $ticket['formatted_event_time'] = $eventDate->format('g:i A');
            
            $purchaseDate = new DateTime($ticket['purchase_date']);
            $ticket['formatted_purchase_date'] = $purchaseDate->format('F j, Y');
            
            // Add status display
            $ticket['status_display'] = ucfirst($ticket['status']);
            
            // Add QR code URL (placeholder - in production, generate actual QR codes)
            $ticket['qr_code_url'] = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-{$ticket['ticket_number']}";
        }
        
        // Get total count for pagination
        $countQuery = '
            SELECT COUNT(*) as total
            FROM tickets t
            WHERE t.user_id = :user_id
        ';
        
        if (!empty($status)) {
            $countQuery .= ' AND t.status = :status';
        }
        
        $countStmt = $db->prepare($countQuery);
        if (!empty($status)) {
            $countStmt->bindParam(':status', $params['status'], PDO::PARAM_STR);
        }
        $countStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $countStmt->execute();
        $totalResult = $countStmt->fetch(PDO::FETCH_ASSOC);
        $total = $totalResult['total'];
        
        // Clean buffer and send response
        ob_clean();
        sendJsonResponse(true, 'Tickets retrieved successfully', [
            'tickets' => $tickets,
            'pagination' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        ob_clean();
        sendJsonResponse(false, 'An error occurred while fetching tickets', null, 500);
    }
    
} else {
    // Method not allowed
    ob_clean();
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
