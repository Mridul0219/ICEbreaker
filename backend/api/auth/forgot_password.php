<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../config/database.php";

$input = get_json_input();
$email = strtolower(input_str($input, "email"));

if ($email === "") {
    send_error("Please enter your email address.");
}

$pdo = get_db_connection();

$stmt = $pdo->prepare("SELECT student_id FROM students WHERE email = ?");
$stmt->execute([$email]);
$found = $stmt->fetch();

if (!$found) {
    $stmt = $pdo->prepare("SELECT alumni_id FROM alumni WHERE email = ?");
    $stmt->execute([$email]);
    $found = $stmt->fetch();
}

if (!$found) {
    send_error("No account found with this email.");
}

// NOTE: this project does not send real emails. This mirrors the
// original frontend's placeholder "reset instructions sent" flow.
send_success("Password reset instructions have been sent.");
