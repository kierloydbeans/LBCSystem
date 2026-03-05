<?php
require_once 'config.php';

// Set content type
header('Content-Type: application/json');

// Handle GET request for fetching events
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Get query parameters
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $upcoming = isset($_GET['upcoming']) ? (bool)$_GET['upcoming'] : true;
        
        // Build base query
        $query = '
            SELECT 
                e.id,
                e.title,
                e.description,
                e.event_date,
                e.base_price,
                e.total_tickets,
                e.available_tickets,
                e.poster_image_url,
                v.name as venue_name,
                v.address as venue_address,
                v.capacity as venue_capacity,
                GROUP_CONCAT(
                    DISTINCT CONCAT(b.name, '|', b.genre, '|', b.facebook_url, '|', b.is_lbc_band, '|', eb.is_headliner)
                    ORDER BY eb.performance_order
                    SEPARATOR ';;'
                ) as bands_data
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN event_bands eb ON e.id = eb.event_id
            LEFT JOIN bands b ON eb.band_id = b.id
            WHERE e.is_active = 1
        ';
        
        $params = [];
        
        // Add upcoming filter if requested
        if ($upcoming) {
            $query .= ' AND e.event_date >= NOW()';
        }
        
        $query .= '
            GROUP BY e.id
            ORDER BY e.event_date ASC
            LIMIT :limit OFFSET :offset
        ';
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $events = $stmt->fetchAll();
        
        // Process bands data for each event
        foreach ($events as &$event) {
            $bands = [];
            if (!empty($event['bands_data'])) {
                $bandEntries = explode(';;', $event['bands_data']);
                foreach ($bandEntries as $bandEntry) {
                    $bandParts = explode('|', $bandEntry);
                    if (count($bandParts) >= 5) {
                        $bands[] = [
                            'name' => $bandParts[0],
                            'genre' => $bandParts[1],
                            'facebook_url' => $bandParts[2],
                            'is_lbc_band' => (bool)$bandParts[3],
                            'is_headliner' => (bool)$bandParts[4]
                        ];
                    }
                }
            }
            
            $event['bands'] = $bands;
            unset($event['bands_data']);
            
            // Format event date
            $eventDate = new DateTime($event['event_date']);
            $event['formatted_date'] = $eventDate->format('F j, Y');
            $event['formatted_time'] = $eventDate->format('g:i A');
            $event['day'] = $eventDate->format('j');
            $event['month'] = $eventDate->format('M');
            
            // Add status based on availability
            if ($event['available_tickets'] == 0) {
                $event['status'] = 'sold_out';
            } elseif ($event['available_tickets'] < $event['total_tickets'] * 0.2) {
                $event['status'] = 'limited';
            } else {
                $event['status'] = 'available';
            }
        }
        
        // Get total count for pagination
        $countQuery = '
            SELECT COUNT(DISTINCT e.id) as total
            FROM events e
            WHERE e.is_active = 1
        ';
        
        if ($upcoming) {
            $countQuery .= ' AND e.event_date >= NOW()';
        }
        
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute();
        $totalResult = $countStmt->fetch();
        $total = $totalResult['total'];
        
        sendJsonResponse(true, 'Events retrieved successfully', [
            'events' => $events,
            'pagination' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        error_log('General error: ' . $e->getMessage());
        sendJsonResponse(false, 'An error occurred while fetching events', null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle POST request for creating events (admin only)
    $userId = requireAuth();
    
    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);
    
    if (!$data) {
        sendJsonResponse(false, 'Invalid JSON data', null, 400);
    }
    
    // Validate required fields
    $requiredFields = ['title', 'event_date', 'venue_id', 'base_price', 'total_tickets'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendJsonResponse(false, ucfirst(str_replace('_', ' ', $field)) . ' is required', null, 400);
        }
    }
    
    try {
        // Connect to database
        $database = new Database();
        $db = $database->connect();
        
        // Check if user is admin (simplified - in production, use proper role system)
        $userStmt = $db->prepare('SELECT email FROM users WHERE id = :user_id AND is_active = 1');
        $userStmt->bindParam(':user_id', $userId);
        $userStmt->execute();
        $user = $userStmt->fetch();
        
        if (!$user || $user['email'] !== 'admin@lostboysclub.com') {
            sendJsonResponse(false, 'Admin access required', null, 403);
        }
        
        // Start transaction
        $db->beginTransaction();
        
        // Insert event
        $insertStmt = $db->prepare('
            INSERT INTO events (title, description, event_date, venue_id, base_price, total_tickets, available_tickets, poster_image_url, is_active)
            VALUES (:title, :description, :event_date, :venue_id, :base_price, :total_tickets, :total_tickets, :poster_image_url, 1)
        ');
        
        $title = sanitizeInput($data['title']);
        $description = isset($data['description']) ? sanitizeInput($data['description']) : null;
        $eventDate = $data['event_date'];
        $venueId = (int)$data['venue_id'];
        $basePrice = (float)$data['base_price'];
        $totalTickets = (int)$data['total_tickets'];
        $posterImageUrl = isset($data['poster_image_url']) ? sanitizeInput($data['poster_image_url']) : null;
        
        $insertStmt->bindParam(':title', $title);
        $insertStmt->bindParam(':description', $description);
        $insertStmt->bindParam(':event_date', $eventDate);
        $insertStmt->bindParam(':venue_id', $venueId);
        $insertStmt->bindParam(':base_price', $basePrice);
        $insertStmt->bindParam(':total_tickets', $totalTickets);
        $insertStmt->bindParam(':poster_image_url', $posterImageUrl);
        
        $insertStmt->execute();
        $eventId = $db->lastInsertId();
        
        // Add bands if provided
        if (isset($data['bands']) && is_array($data['bands'])) {
            foreach ($data['bands'] as $bandData) {
                if (isset($bandData['band_id'])) {
                    $bandStmt = $db->prepare('
                        INSERT INTO event_bands (event_id, band_id, is_headliner, performance_order)
                        VALUES (:event_id, :band_id, :is_headliner, :performance_order)
                    ');
                    
                    $bandId = (int)$bandData['band_id'];
                    $isHeadliner = isset($bandData['is_headliner']) ? (bool)$bandData['is_headliner'] : false;
                    $performanceOrder = isset($bandData['performance_order']) ? (int)$bandData['performance_order'] : 0;
                    
                    $bandStmt->bindParam(':event_id', $eventId);
                    $bandStmt->bindParam(':band_id', $bandId);
                    $bandStmt->bindParam(':is_headliner', $isHeadliner);
                    $bandStmt->bindParam(':performance_order', $performanceOrder);
                    
                    $bandStmt->execute();
                }
            }
        }
        
        // Commit transaction
        $db->commit();
        
        sendJsonResponse(true, 'Event created successfully', [
            'event_id' => $eventId
        ]);
        
    } catch (PDOException $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        error_log('Database error: ' . $e->getMessage());
        sendJsonResponse(false, 'Database error occurred', null, 500);
    } catch (Exception $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        error_log('General error: ' . $e->getMessage());
        sendJsonResponse(false, 'An error occurred while creating event', null, 500);
    }
    
} else {
    // Method not allowed
    sendJsonResponse(false, 'Method not allowed', null, 405);
}
?>
