<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();
$id = isset($input["id"]) ? (int) $input["id"] : 0;
$proofNote = input_str($input, "proofNote");
$proofLink = input_str($input, "proofLink");

if ($proofNote === "") {
    send_error("Please provide a note for the student.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM referral_requests WHERE referral_id = ? AND alumni_id = ? AND status = 'pending'");
$stmt->execute([$id, $session["id"]]);
$row = $stmt->fetch();
if (!$row) {
    send_error("Referral request not found.", 404);
}

$pdo->prepare("UPDATE referral_requests SET status = 'referred', proof_note = ?, proof_link = ? WHERE referral_id = ?")
    ->execute([$proofNote, $proofLink, $id]);

$nameStmt = $pdo->prepare("SELECT name FROM alumni WHERE alumni_id = ?");
$nameStmt->execute([$session["id"]]);
$name = $nameStmt->fetchColumn();

add_notification(
    $pdo,
    "student",
    $row["student_id"],
    "Referral Submitted 🎉",
    "{$name} submitted a referral for {$row["position"]} at {$row["company"]}."
);

send_success("Referral submitted successfully.");
