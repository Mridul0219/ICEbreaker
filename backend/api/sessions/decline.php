<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();
$id = isset($input["id"]) ? (int) $input["id"] : 0;

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM sessions WHERE session_id = ? AND alumni_id = ? AND status = 'pending'");
$stmt->execute([$id, $session["id"]]);
$row = $stmt->fetch();
if (!$row) {
    send_error("Session request not found.", 404);
}

$pdo->prepare("UPDATE sessions SET status = 'declined' WHERE session_id = ?")->execute([$id]);

$alumniName = $pdo->prepare("SELECT name FROM alumni WHERE alumni_id = ?");
$alumniName->execute([$session["id"]]);
$name = $alumniName->fetchColumn();

add_notification($pdo, "student", $row["student_id"], "Session Request Declined", "{$name} declined your mentorship session request.");

send_success("Session request declined.");
