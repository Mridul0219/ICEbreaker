<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$pdo = get_db_connection();

$column = $session["role"] === "student" ? "student_id" : "alumni_id";
$stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE {$column} = ? AND is_read = 0");
$stmt->execute([$session["id"]]);

send_success("Notifications marked as read.");
