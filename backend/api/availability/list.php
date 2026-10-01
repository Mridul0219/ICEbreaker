<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$pdo = get_db_connection();

$stmt = $pdo->prepare(
    "SELECT * FROM availability WHERE alumni_id = ? ORDER BY available_date ASC, start_time ASC"
);
$stmt->execute([$session["id"]]);

$slots = array_map(function ($row) {
    return [
        "id" => (int) $row["availability_id"],
        "date" => $row["available_date"],
        "time" => substr($row["start_time"], 0, 5),
        "duration" => minutes_between($row["start_time"], $row["end_time"]),
        "status" => $row["status"]
    ];
}, $stmt->fetchAll());

send_success("", $slots);

function minutes_between($start, $end)
{
    $s = strtotime($start);
    $e = strtotime($end);
    return (int) round(($e - $s) / 60);
}
