<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
require_once 'db_config.php';

// Handle PUT request - UPDATE operation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID is required']);
            exit;
        }

        // Get updateable fields
        $fields = [];
        $values = [':id' => $id];
        $allowedFields = ['firstName', 'middleName', 'lastName', 'email', 'phone', 'feedback', 'category', 'rating'];

        foreach ($allowedFields as $field) {
            if (isset($_POST[$field]) && !empty($_POST[$field])) {
                $fields[] = "$field = :$field";
                $values[":$field"] = $_POST[$field];
            }
        }

        if (empty($fields)) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit;
        }

        // Build UPDATE query
        $query = "UPDATE submissions SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = :id";

        $pdo = getDbConnection();
        $stmt = $pdo->prepare($query);
        $result = $stmt->execute($values);

        if ($result && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Submission updated successfully!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No submission found or no changes made']);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
