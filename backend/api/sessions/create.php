<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("student");
$input = get_json_input();

$alumni = decode_id($input["alumniId"] ?? "");
$slotId = isset($input["slotId"]) ? (int) $input["slotId"] : 0;
$message = input_str($input, "message");

if (!$alumni || $alumni["role"] !== "alumni" || $slotId <= 0 || $message === "") {
    send_error("Please select a valid slot and enter a message.");
}

$pdo = get_db_connection();

$slotStmt = $pdo->prepare(
    "SELECT * FROM availability WHERE availability_id = ? AND alumni_id = ? AND status = 'available'"
);
$slotStmt->execute([$slotId, $alumni["id"]]);
$slot = $slotStmt->fetch();

if (!$slot) {
    send_error("Please select a valid slot.");
}

// Note: the slot is intentionally left "available" after a request,
// matching the original frontend behaviour of allowing multiple
// students to request the same slot until the alumni accepts one.
$insert = $pdo->prepare(
    "INSERT INTO sessions (student_id, alumni_id, availability_id, message, session_date, start_time, end_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')"
);
$insert->execute([
    $session["id"],
    $alumni["id"],
    $slot["availability_id"],
    $message,
    $slot["available_date"],
    $slot["start_time"],
    $slot["end_time"]
]);

$studentStmt = $pdo->prepare("SELECT name FROM students WHERE student_id = ?");
$studentStmt->execute([$session["id"]]);
$studentName = $studentStmt->fetchColumn();

add_notification($pdo, "alumni", $alumni["id"], "New Mentorship Request", "{$studentName} requested a mentorship session with you.");

send_success("Mentorship request sent successfully.");
