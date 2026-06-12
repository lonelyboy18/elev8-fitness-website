<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

require_once 'db_config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
    $confirmDelete = isset($_POST['confirmDelete']);

    if ($email === '' || $password === '') {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email']);
        exit;
    }

    if (!$confirmDelete) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please confirm account deletion']);
        exit;
    }

    $pdo = getDbConnection();

    $selectStmt = $pdo->prepare('SELECT id, password FROM users WHERE email = :email LIMIT 1');
    $selectStmt->execute([':email' => $email]);
    $user = $selectStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    $deleteStmt = $pdo->prepare('DELETE FROM users WHERE id = :id LIMIT 1');
    $deleted = $deleteStmt->execute([':id' => (int) $user['id']]);

    if (!$deleted || $deleteStmt->rowCount() < 1) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Unable to delete account']);
        exit;
    }

    if (isset($_SESSION['user_id']) && (int) $_SESSION['user_id'] === (int) $user['id']) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }

    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Your account has been deleted successfully']);
} catch (PDOException $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>