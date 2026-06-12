<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
require_once 'db_config.php';

// Handle GET request - READ operation
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $pdo = getDbConnection();

        // Check if specific submission ID is requested
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM submissions WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($submission) {
                ob_end_clean();
                echo json_encode(['success' => true, 'data' => $submission]);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Submission not found']);
            }
        } else {
            // Get all submissions
            $stmt = $pdo->query("SELECT * FROM submissions ORDER BY created_at DESC");
            $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'count' => count($submissions),
                'data' => $submissions
            ]);
        }

    } catch (PDOException $e) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
