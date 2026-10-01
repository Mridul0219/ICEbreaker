<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();

$date = input_str($input, "date");
$time = input_str($input, "time");
$duration = isset($input["duration"]) ? (int) $input["duration"] : 0;

if ($date === "" || $time === "" || $duration <= 0) {
    send_error("Please fill all availability fields.");
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)) {
    send_error("Invalid date or time format.");
}

$startTime = $time . ":00";
$endTime = date("H:i:s", strtotime($startTime) + $duration * 60);

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    "INSERT INTO availability (alumni_id, available_date, start_time, end_time, status)
     VALUES (?, ?, ?, ?, 'available')"
);
$stmt->execute([$session["id"], $date, $startTime, $endTime]);

send_success("Availability slot added.", ["id" => (int) $pdo->lastInsertId()]);
