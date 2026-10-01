<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../helpers/notification_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("student");
$input = get_json_input();

$alumni = decode_id($input["alumniId"] ?? "");
$company = input_str($input, "company");
$position = input_str($input, "position");
$cvLink = input_str($input, "cvLink");
$portfolioLink = input_str($input, "portfolioLink");
$message = input_str($input, "message");

if (!$alumni || $alumni["role"] !== "alumni" || $company === "" || $position === "" || $cvLink === "" || $message === "") {
    send_error("Please fill in all required referral fields.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    "INSERT INTO referral_requests (student_id, alumni_id, company, position, cv_link, portfolio_link, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')"
);
$stmt->execute([$session["id"], $alumni["id"], $company, $position, $cvLink, $portfolioLink, $message]);

$studentStmt = $pdo->prepare("SELECT name FROM students WHERE student_id = ?");
$studentStmt->execute([$session["id"]]);
$studentName = $studentStmt->fetchColumn();

add_notification($pdo, "alumni", $alumni["id"], "New Referral Request", "{$studentName} requested a job referral for {$position} at {$company}.");

send_success("Referral request submitted successfully.");
