<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();
$id = isset($input["id"]) ? (int) $input["id"] : 0;
$status = input_str($input, "status");

if (!in_array($status, ["declined"], true)) {
    send_error("Invalid status.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM referral_requests WHERE referral_id = ? AND alumni_id = ? AND status = 'pending'");
$stmt->execute([$id, $session["id"]]);
$row = $stmt->fetch();
if (!$row) {
    send_error("Referral request not found.", 404);
}

$pdo->prepare("UPDATE referral_requests SET status = ? WHERE referral_id = ?")->execute([$status, $id]);

$nameStmt = $pdo->prepare("SELECT name FROM alumni WHERE alumni_id = ?");
$nameStmt->execute([$session["id"]]);
$name = $nameStmt->fetchColumn();

add_notification(
    $pdo,
    "student",
    $row["student_id"],
    "Referral Status: Declined",
    "{$name} updated your referral status for {$row["position"]} at {$row["company"]} to declined."
);

send_success("Referral status updated to declined.");
