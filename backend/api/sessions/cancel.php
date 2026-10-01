<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$input = get_json_input();
$id = isset($input["id"]) ? (int) $input["id"] : 0;
$reason = input_str($input, "reason");

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM sessions WHERE session_id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    send_error("Session not found.", 404);
}

$isOwner = ($session["role"] === "student" && $row["student_id"] == $session["id"])
    || ($session["role"] === "alumni" && $row["alumni_id"] == $session["id"]);

if (!$isOwner) {
    send_error("You are not allowed to cancel this session.", 403);
}
if (!in_array($row["status"], ["pending", "confirmed"], true)) {
    send_error("This session cannot be cancelled.");
}

$pdo->prepare("UPDATE sessions SET status = 'cancelled' WHERE session_id = ?")->execute([$id]);

if ($session["role"] === "student") {
    $nameStmt = $pdo->prepare("SELECT name FROM students WHERE student_id = ?");
    $nameStmt->execute([$session["id"]]);
    $name = $nameStmt->fetchColumn();
    $message = "{$name} cancelled the mentorship session scheduled for {$row["session_date"]}.";
    add_notification($pdo, "alumni", $row["alumni_id"], "Session Cancelled", $message);
} else {
    $nameStmt = $pdo->prepare("SELECT name FROM alumni WHERE alumni_id = ?");
    $nameStmt->execute([$session["id"]]);
    $name = $nameStmt->fetchColumn();
    $message = "{$name} cancelled your mentorship session scheduled for {$row["session_date"]}." . ($reason !== "" ? " Reason: {$reason}" : "");
    add_notification($pdo, "student", $row["student_id"], "Session Cancelled", $message);
}

send_success("Session cancelled successfully.");
