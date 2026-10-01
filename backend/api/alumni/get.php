<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../config/database.php";

require_login();

$decoded = decode_id($_GET["id"] ?? "");
if (!$decoded || $decoded["role"] !== "alumni") {
    send_error("Alumni not found.", 404);
}

$pdo = get_db_connection();

$stmt = $pdo->prepare("SELECT * FROM alumni WHERE alumni_id = ?");
$stmt->execute([$decoded["id"]]);
$row = $stmt->fetch();
if (!$row) {
    send_error("Alumni not found.", 404);
}

$slotStmt = $pdo->prepare(
    "SELECT * FROM availability
     WHERE alumni_id = ? AND status = 'available' AND available_date >= CURDATE()
     ORDER BY available_date ASC, start_time ASC"
);
$slotStmt->execute([$decoded["id"]]);
$slots = array_map(function ($slot) {
    return [
        "id" => (int) $slot["availability_id"],
        "date" => $slot["available_date"],
        "time" => substr($slot["start_time"], 0, 5),
        "duration" => minutes_between($slot["start_time"], $slot["end_time"])
    ];
}, $slotStmt->fetchAll());

send_success("", [
    "id" => encode_id("alumni", $row["alumni_id"]),
    "name" => $row["name"],
    "email" => $row["email"],
    "department" => $row["department"] ?? "",
    "company" => $row["company"] ?? "",
    "jobTitle" => $row["job_title"] ?? "",
    "skills" => $row["skills"] ?? "",
    "bio" => $row["bio"] ?? "",
    "slots" => $slots
]);

function minutes_between($start, $end)
{
    $s = strtotime($start);
    $e = strtotime($end);
    return (int) round(($e - $s) / 60);
}
