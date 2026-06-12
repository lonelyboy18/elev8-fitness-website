<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
require_once 'db_config.php';

// Handle DELETE request - DELETE operation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'DELETE') {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

        if (empty($id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'ID is required']);
            exit;
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare("DELETE FROM submissions WHERE id = :id");
        $result = $stmt->execute([':id' => $id]);

        if ($result && $stmt->rowCount() > 0) {
            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'Submission deleted successfully!']);
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'No submission found']);
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
