<?php
// MySQL Configuration for XAMPP/phpMyAdmin
$dbHost = '127.0.0.1';
$dbPort = '3306';
$dbName = 'elev8_db';
$dbUser = 'root';
$dbPass = '';

$pdo = null;
$dbConnectionError = null;
$dbInitializationError = null;

try {
    // Connect to MySQL server first (without DB) so DB can be auto-created.
    $serverPdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // Connect to the selected project database.
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    $dbConnectionError = 'Database connection failed: ' . $e->getMessage();
}

// Initialize database tables if they do not exist
function initializeDatabase($pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(100) NOT NULL,
            middleName VARCHAR(100) NULL,
            lastName VARCHAR(100) NOT NULL,
            dob DATE NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            feedback TEXT NOT NULL,
            category VARCHAR(100) NULL,
            rating INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            gender VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (PDOException $e) {
        return 'Error initializing database: ' . $e->getMessage();
    }

    return null;
}

if ($pdo instanceof PDO) {
    $dbInitializationError = initializeDatabase($pdo);
}

// Helper function to get database connection
function getDbConnection() {
    global $pdo, $dbConnectionError, $dbInitializationError;

    if ($dbConnectionError !== null) {
        throw new RuntimeException($dbConnectionError);
    }

    if ($dbInitializationError !== null) {
        throw new RuntimeException($dbInitializationError);
    }

    if (!$pdo instanceof PDO) {
        throw new RuntimeException('Database connection is not available.');
    }

    return $pdo;
}
