<?php
/*
 * World of Hospitality — Careers application handler
 * --------------------------------------------------
 * Receives a multipart/form-data POST from /careers.html
 * Validates fields and CV upload, then emails the
 * application to the address in $RECIPIENT below.
 *
 * Works on any PHP host with mail() enabled (HostGator does).
 * No external libraries required.
 */

header('Content-Type: application/json; charset=utf-8');

// ─── CONFIG ─────────────────────────────────────────────────
$RECIPIENT     = 'careers@worldofhospitality.com.qa';
$FROM_ADDRESS  = 'noreply@worldofhospitality.com.qa';      // change if your domain blocks this
$FROM_NAME     = 'WOH Careers';
$MAX_FILE_SIZE = 5 * 1024 * 1024;                          // 5 MB
$ALLOWED_TYPES = ['pdf', 'doc', 'docx', 'rtf'];

// ─── HELPERS ────────────────────────────────────────────────
function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

// Strip CRLF / header-injection attempts
function clean_header($s) {
    return trim(preg_replace('/[\r\n%0a%0d]/i', '', $s));
}

// ─── METHOD GUARD ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed', 405);
}

// ─── HONEYPOT (basic spam) ─────────────────────────────────
if (!empty($_POST['website'])) {
    // Pretend success so bots don't retry
    echo json_encode(['ok' => true]);
    exit;
}

// ─── COLLECT FIELDS ────────────────────────────────────────
$name     = clean_header($_POST['name']     ?? '');
$email    = clean_header($_POST['email']    ?? '');
$phone    = clean_header($_POST['phone']    ?? '');
$role     = clean_header($_POST['role']     ?? 'Open application');
$linkedin = clean_header($_POST['linkedin'] ?? '');
$message  = trim($_POST['message']          ?? '');

// ─── VALIDATE ──────────────────────────────────────────────
if (!$name || !$email || !$phone)            fail('Please fill name, phone and email.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('That email address looks wrong.');
if (strlen($name) > 120)                     fail('Name is too long.');
if (strlen($phone) > 40)                     fail('Phone is too long.');
if (strlen($message) > 5000)                 fail('Cover note is too long (5,000 char max).');

if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
    fail('Please attach a CV.');
}
$cv = $_FILES['cv'];
if ($cv['size'] > $MAX_FILE_SIZE) fail('CV is larger than 5 MB.');

$ext = strtolower(pathinfo($cv['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $ALLOWED_TYPES, true)) {
    fail('CV must be PDF, DOC, DOCX, or RTF.');
}

$cv_data    = @file_get_contents($cv['tmp_name']);
if ($cv_data === false) fail('Could not read uploaded file.', 500);
$cv_name    = preg_replace('/[^A-Za-z0-9._-]/', '_', $cv['name']);

// ─── BUILD EMAIL ───────────────────────────────────────────
$boundary = md5(uniqid('woh', true));
$subject  = "Application — $role — $name";

$headers  = "From: $FROM_NAME <$FROM_ADDRESS>\r\n";
$headers .= "Reply-To: " . addslashes($name) . " <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=utf-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";

$body .= "NEW APPLICATION — WORLD OF HOSPITALITY\r\n";
$body .= "======================================\r\n\r\n";
$body .= "Role:       $role\r\n";
$body .= "Name:       $name\r\n";
$body .= "Email:      $email\r\n";
$body .= "Phone:      $phone\r\n";
if ($linkedin) $body .= "LinkedIn:   $linkedin\r\n";
$body .= "Received:   " . date('Y-m-d H:i:s') . " UTC\r\n";
if (!empty($_SERVER['REMOTE_ADDR'])) $body .= "IP:         {$_SERVER['REMOTE_ADDR']}\r\n";
$body .= "\r\n--- COVER NOTE ---\r\n\r\n";
$body .= ($message !== '' ? $message : '(none)') . "\r\n\r\n";

// Attach CV
$body .= "--$boundary\r\n";
$body .= "Content-Type: application/octet-stream; name=\"$cv_name\"\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n";
$body .= "Content-Disposition: attachment; filename=\"$cv_name\"\r\n\r\n";
$body .= chunk_split(base64_encode($cv_data));
$body .= "--$boundary--";

// ─── SEND ──────────────────────────────────────────────────
$ok = @mail($RECIPIENT, $subject, $body, $headers);

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    fail(
        "Sorry — couldn't send the application. Please email careers@worldofhospitality.com.qa directly.",
        500
    );
}
