<?php
declare(strict_types=1);

// ---------------------------------------------------------------------------
// Database connection — reads from environment variables first, then defaults
// Set env vars in production; leave defaults for XAMPP local dev.
// ---------------------------------------------------------------------------

define('DB_HOST',    (string)(getenv('DB_HOST') ?: '127.0.0.1'));
define('DB_PORT',    (string)(getenv('DB_PORT') ?: '3306'));
define('DB_NAME',    (string)(getenv('DB_NAME') ?: 'elev8_db'));
define('DB_USER',    (string)(getenv('DB_USER') ?: 'root'));
define('DB_PASS',    (string)(getenv('DB_PASS') ?: ''));
define('DB_CHARSET', 'utf8mb4');

/**
 * Returns a singleton PDO instance.
 * Tables are auto-created on first connection so no manual SQL import is needed.
 */
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
    );

    // First try to connect with the target database name
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // If database doesn't exist yet, create it then reconnect
        if (str_contains($e->getMessage(), 'Unknown database') ||
            str_contains($e->getMessage(), "Can't connect") === false) {
            try {
                $root = new PDO(
                    sprintf('mysql:host=%s;port=%s;charset=%s', DB_HOST, DB_PORT, DB_CHARSET),
                    DB_USER, DB_PASS,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                $root->exec(
                    "CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "`
                     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                );
                unset($root);
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e2) {
                _dbError('Could not create database: ' . $e2->getMessage());
            }
        } else {
            _dbError('Database connection failed. Is XAMPP MySQL running? ' . $e->getMessage());
        }
    }

    _initSchema($pdo);
    return $pdo;
}

/** Auto-creates all tables using IF NOT EXISTS — safe to run on every boot. */
function _initSchema(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name                 VARCHAR(120) NOT NULL,
            email                VARCHAR(255) NOT NULL,
            mobile               VARCHAR(20)  NOT NULL,
            password             VARCHAR(255) NOT NULL,
            plan                 VARCHAR(20)  NOT NULL DEFAULT 'bft',
            subscription_status  VARCHAR(20)  NOT NULL DEFAULT 'inactive',
            subscription_expires DATE         NULL,
            created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Upgrade path: add columns that didn't exist in Task-1 schema
    try {
        $pdo->exec("ALTER TABLE users
            ADD COLUMN IF NOT EXISTS subscription_status  VARCHAR(20) NOT NULL DEFAULT 'inactive',
            ADD COLUMN IF NOT EXISTS subscription_expires DATE NULL");
    } catch (\PDOException $e) { /* column already exists — safe to ignore */ }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS submissions (
            id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(120) NOT NULL,
            email      VARCHAR(255) NOT NULL,
            feedback   TEXT         NOT NULL,
            rating     TINYINT UNSIGNED NOT NULL,
            created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rating (rating),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bookings (
            id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id    INT UNSIGNED NOT NULL,
            class_type VARCHAR(20)  NOT NULL,
            class_date DATE         NOT NULL,
            time_slot  VARCHAR(10)  NOT NULL,
            status     VARCHAR(20)  NOT NULL DEFAULT 'confirmed',
            created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user   (user_id),
            INDEX idx_date   (class_date),
            INDEX idx_slot   (class_date, time_slot, class_type, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS blog_posts (
            id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
            title        VARCHAR(255)  NOT NULL,
            slug         VARCHAR(255)  NOT NULL,
            category     VARCHAR(60)   NOT NULL DEFAULT 'General',
            excerpt      TEXT          NOT NULL,
            content      LONGTEXT      NOT NULL,
            author       VARCHAR(120)  NOT NULL DEFAULT 'ELEV8 Team',
            status       VARCHAR(20)   NOT NULL DEFAULT 'published',
            published_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_slug     (slug),
            INDEX idx_status       (status),
            INDEX idx_category     (category),
            INDEX idx_published_at (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS blog_comments (
            id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
            post_id    INT UNSIGNED  NOT NULL,
            name       VARCHAR(120)  NOT NULL,
            email      VARCHAR(255)  NOT NULL,
            comment    TEXT          NOT NULL,
            status     VARCHAR(20)   NOT NULL DEFAULT 'approved',
            created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
            INDEX idx_post (post_id, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contacts (
            id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(120)  NOT NULL,
            email      VARCHAR(255)  NOT NULL,
            phone      VARCHAR(20)   DEFAULT NULL,
            message    TEXT          NOT NULL,
            created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS payments (
            id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id             INT UNSIGNED NOT NULL,
            plan                VARCHAR(20)  NOT NULL,
            duration_months     TINYINT      NOT NULL DEFAULT 1,
            amount_paise        INT          NOT NULL,
            currency            VARCHAR(10)  NOT NULL DEFAULT 'INR',
            razorpay_order_id   VARCHAR(100) NOT NULL,
            razorpay_payment_id VARCHAR(100) DEFAULT NULL,
            status              VARCHAR(20)  NOT NULL DEFAULT 'pending',
            created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            paid_at             TIMESTAMP    NULL DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user      (user_id),
            INDEX idx_order     (razorpay_order_id),
            UNIQUE KEY uq_payment (razorpay_payment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

/** Outputs a JSON error and halts. Used before helpers.php is loaded. */
function _dbError(string $msg): never
{
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
