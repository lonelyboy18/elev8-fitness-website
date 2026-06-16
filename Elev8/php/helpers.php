<?php
declare(strict_types=1);

// ---------------------------------------------------------------------------
// Shared helper functions — included by every PHP endpoint.
// ---------------------------------------------------------------------------


// ============================================================
// Session
// ============================================================

function startSecureSession(): void
{
    if (session_status() !== PHP_SESSION_NONE) return;

    session_set_cookie_params([
        'lifetime' => 0,          // expires when browser closes
        'path'     => '/',
        'secure'   => false,      // set true in production (HTTPS only)
        'httponly' => true,       // JS cannot read session cookie
        'samesite' => 'Strict',   // mitigates CSRF
    ]);

    session_name('ELEV8SESS');
    session_start();
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']) && is_int($_SESSION['user_id']);
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        jsonError(401, 'Authentication required. Please sign in.');
    }
}

function sessionUser(): array
{
    return [
        'id'   => $_SESSION['user_id']   ?? null,
        'name' => $_SESSION['user_name'] ?? '',
        'plan' => $_SESSION['user_plan'] ?? 'bft',
    ];
}


// ============================================================
// CSRF
// ============================================================

function generateCSRFToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken(string $token): bool
{
    return !empty($_SESSION['csrf_token']) &&
           hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Validates the X-CSRF-Token header sent by every AJAX request.
 * Call this at the top of any state-mutating endpoint.
 */
function requireCSRF(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!validateCSRFToken($token)) {
        jsonError(403, 'Security token mismatch. Please refresh the page and try again.');
    }
}


// ============================================================
// HTTP / Response
// ============================================================

function requireMethod(string ...$methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        jsonError(405, 'Method not allowed.');
    }
}

function setCORSHeaders(): void
{
    // Allow the same origin that serves the HTML pages (localhost in dev)
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function jsonResponse(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(int $status, string $message): never
{
    jsonResponse(['success' => false, 'message' => $message], $status);
}

function jsonSuccess(string $message, array $extra = []): never
{
    jsonResponse(array_merge(['success' => true, 'message' => $message], $extra));
}

function jsonValidationError(array $errors): never
{
    jsonResponse(['success' => false, 'errors' => $errors], 422);
}


// ============================================================
// Input
// ============================================================

/**
 * Reads and decodes the JSON body sent by fetch().
 * Exits with 400 if the body is not valid JSON.
 */
function readJSONBody(): array
{
    $raw  = (string) file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        jsonError(400, 'Invalid request body — expected JSON.');
    }

    return $data;
}

function field(array $data, string $key): string
{
    return trim((string)($data[$key] ?? ''));
}

function fieldInt(array $data, string $key): int
{
    return (int)($data[$key] ?? 0);
}


// ============================================================
// Validation
// ============================================================

function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validates a 10-digit Indian mobile number.
 * Accepts optional +91 / 0 prefix; strips it before checking.
 */
function isValidMobile(string $mobile): bool
{
    $cleaned = preg_replace('/\D/', '', $mobile);
    // Strip country code if present
    if (strlen($cleaned) === 12 && str_starts_with($cleaned, '91')) {
        $cleaned = substr($cleaned, 2);
    }
    return (bool) preg_match('/^[6-9]\d{9}$/', $cleaned);
}

function cleanMobile(string $mobile): string
{
    $cleaned = preg_replace('/\D/', '', $mobile);
    if (strlen($cleaned) === 12 && str_starts_with($cleaned, '91')) {
        $cleaned = substr($cleaned, 2);
    }
    return $cleaned;
}

function sanitize(string $str): string
{
    return htmlspecialchars(strip_tags($str), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

const ALLOWED_PLANS = ['bft', 'cst'];
