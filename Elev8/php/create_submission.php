<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
require_once 'db_config.php';

// Handle POST request - CREATE operation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get POST data (supports both split-name and full-name forms)
        $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
        $middleName = isset($_POST['middleName']) ? trim($_POST['middleName']) : '';
        $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
        $dob = isset($_POST['dob']) ? trim($_POST['dob']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $feedback = isset($_POST['feedback']) ? trim($_POST['feedback']) : '';
        $category = isset($_POST['suggestionCategory']) ? trim($_POST['suggestionCategory']) : '';
        $rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;

        // Backward compatibility for older form field names
        if (empty($category) && isset($_POST['maritalStatus'])) {
            $category = trim($_POST['maritalStatus']);
        }

        if ((empty($firstName) || empty($lastName)) && isset($_POST['fullName'])) {
            $fullName = trim($_POST['fullName']);
            if (!empty($fullName)) {
                $nameParts = preg_split('/\s+/', $fullName);
                $firstName = $nameParts[0] ?? $firstName;
                if (count($nameParts) >= 3) {
                    $lastName = array_pop($nameParts);
                    $middleName = implode(' ', array_slice($nameParts, 1));
                } elseif (count($nameParts) === 2) {
                    $lastName = $nameParts[1];
                }
            }
        }

        // Validate required fields
        if (empty($firstName) || empty($lastName) || empty($dob) || empty($email) || empty($phone) || empty($feedback)) {
            echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
            exit;
        }

        // Insert data into database
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            INSERT INTO submissions (firstName, middleName, lastName, dob, email, phone, feedback, category, rating)
            VALUES (:firstName, :middleName, :lastName, :dob, :email, :phone, :feedback, :category, :rating)
        ");

        $result = $stmt->execute([
            ':firstName' => $firstName,
            ':middleName' => $middleName,
            ':lastName' => $lastName,
            ':dob' => $dob,
            ':email' => $email,
            ':phone' => $phone,
            ':feedback' => $feedback,
            ':category' => $category,
            ':rating' => $rating
        ]);

        if ($result) {
            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully!', 'id' => $pdo->lastInsertId()]);
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to submit feedback']);
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
