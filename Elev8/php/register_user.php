<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $mobile = isset($_POST['mobile']) ? preg_replace('/\D+/', '', $_POST['mobile']) : '';
    $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
    $confirmPassword = isset($_POST['confirmPassword']) ? (string) $_POST['confirmPassword'] : '';
    $gender = isset($_POST['gender']) ? strtolower(trim($_POST['gender'])) : '';
    $termsAccepted = isset($_POST['terms']);

    if ($name === '' || $email === '' || $mobile === '' || $password === '' || $confirmPassword === '' || $gender === '') {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email']);
        exit;
    }

    if (!preg_match('/^[0-9]{10}$/', $mobile)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please enter a valid 10-digit mobile number']);
        exit;
    }

    if (strlen($password) < 6) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }

    if ($password !== $confirmPassword) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }

    if (!in_array($gender, ['male', 'female'], true)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please select a valid gender']);
        exit;
    }

    if (!$termsAccepted) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please accept terms and conditions']);
        exit;
    }

    $pdo = getDbConnection();

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $checkStmt->execute([':email' => $email]);

    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'This email is already registered']);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insertStmt = $pdo->prepare(
        'INSERT INTO users (name, email, mobile, password, gender) VALUES (:name, :email, :mobile, :password, :gender)'
    );

    $insertResult = $insertStmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':mobile' => $mobile,
        ':password' => $passwordHash,
        ':gender' => $gender,
    ]);

    if (!$insertResult) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again']);
        exit;
    }

    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} catch (PDOException $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>