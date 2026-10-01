<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$pdo = get_db_connection();

$column = $session["role"] === "student" ? "student_id" : "alumni_id";
$stmt = $pdo->prepare("DELETE FROM notifications WHERE {$column} = ?");
$stmt->execute([$session["id"]]);

send_success("Notifications cleared.");
