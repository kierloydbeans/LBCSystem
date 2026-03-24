<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    // Create database connection
    $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all bands
        $stmt = $conn->prepare("
            SELECT 
                b.id, 
                b.name, 
                b.description, 
                b.genre, 
                b.facebook_url, 
                b.spotify_embed_url, 
                b.is_lbc_band, 
                b.is_active, 
                b.created_at, 
                b.updated_at,
                bp.photo_url as band_image
            FROM bands b
            LEFT JOIN band_photos bp ON b.id = bp.band_id AND bp.is_primary = 1
            WHERE b.is_active = 1 
            ORDER BY b.name ASC
        ");
        
        $stmt->execute();
        $bands = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the response
        foreach ($bands as &$band) {
            // Convert boolean values
            $band['is_lbc_band'] = (bool)$band['is_lbc_band'];
            $band['is_active'] = (bool)$band['is_active'];
            
            // Format dates
            $band['created_at'] = date('Y-m-d H:i:s', strtotime($band['created_at']));
            $band['updated_at'] = date('Y-m-d H:i:s', strtotime($band['updated_at']));
            
            // Handle band_image path
            if ($band['band_image']) {
                // Remove quotes and clean up the path
                $cleanPath = stripslashes(trim($band['band_image'], '"'));
                
                // Extract just the filename if it's a full path
                $filename = basename($cleanPath);
                
                // Construct the proper URL path to the images folder
                $band['band_image'] = 'assets/images/' . $filename;
            } else {
                $band['band_image'] = null;
            }
        }
        
        sendJsonResponse(true, 'Bands retrieved successfully', [
            'bands' => $bands,
            'count' => count($bands)
        ]);
        
    } else {
        sendJsonResponse(false, 'Method not allowed', null, 405);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
} catch (Exception $e) {
    sendJsonResponse(false, 'Server error: ' . $e->getMessage(), null, 500);
}
?>
