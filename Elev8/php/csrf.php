<?php
declare(strict_types=1);

require_once __DIR__ . '/../php/helpers.php';

// Fetched on page-load by every form via GET.
// Returns a fresh session-bound CSRF token.

setCORSHeaders();
startSecureSession();
requireMethod('GET');

jsonSuccess('OK', ['token' => generateCSRFToken()]);
