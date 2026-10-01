<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$pdo = get_db_connection();

$column = $session["role"] === "student" ? "student_id" : "alumni_id";
$stmt = $pdo->prepare("SELECT * FROM notifications WHERE {$column} = ? ORDER BY created_at DESC");
$stmt->execute([$session["id"]]);

$notifications = array_map(function ($row) {
    return [
        "id" => (int) $row["notification_id"],
        "title" => $row["title"],
        "message" => $row["message"],
        "isRead" => (bool) $row["is_read"],
        "createdAt" => $row["created_at"]
    ];
}, $stmt->fetchAll());

send_success("", $notifications);
