<?php
// Simple test to check if events API is working
require_once 'api/config.php';

try {
    // Connect to database
    $database = new Database();
    $db = $database->connect();
    
    // Test query
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
            v.capacity as venue_capacity
        FROM events e
        LEFT JOIN venues v ON e.venue_id = v.id
        WHERE e.is_active = 1
        AND e.event_date >= NOW()
        ORDER BY e.event_date ASC
        LIMIT 6
    ';
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Events API Test</h2>";
    echo "<p>Total upcoming events found: " . count($events) . "</p>";
    
    if ($events) {
        echo "<h3>Events:</h3>";
        echo "<ul>";
        foreach ($events as $event) {
            echo "<li><strong>" . htmlspecialchars($event['title']) . "</strong> - " . $event['event_date'] . " at " . htmlspecialchars($event['venue_name']) . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No events found</p>";
    }
    
    // Test if bands are connected
    echo "<h3>Testing Event-Bands Connections:</h3>";
    $bandQuery = '
        SELECT 
            e.title as event_title,
            b.name as band_name,
            eb.is_headliner
        FROM events e
        LEFT JOIN event_bands eb ON e.id = eb.event_id
        LEFT JOIN bands b ON eb.band_id = b.id
        WHERE e.is_active = 1
        ORDER BY e.event_date ASC, eb.performance_order ASC
        LIMIT 10
    ';
    
    $bandStmt = $db->prepare($bandQuery);
    $bandStmt->execute();
    $bandConnections = $bandStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($bandConnections) {
        echo "<ul>";
        foreach ($bandConnections as $connection) {
            $headliner = $connection['is_headliner'] ? " (HEADLINER)" : "";
            echo "<li>" . htmlspecialchars($connection['event_title']) . " - " . htmlspecialchars($connection['band_name']) . $headliner . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No band connections found</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
