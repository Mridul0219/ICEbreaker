<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$pdo = get_db_connection();

if ($session["role"] === "student") {
    $stmt = $pdo->prepare(
        "SELECT s.*, a.name AS other_name, a.company AS other_company
         FROM sessions s
         JOIN alumni a ON a.alumni_id = s.alumni_id
         WHERE s.student_id = ?
         ORDER BY s.created_at DESC"
    );
    $stmt->execute([$session["id"]]);
} else {
    $stmt = $pdo->prepare(
        "SELECT s.*, st.name AS other_name, st.department AS other_department
         FROM sessions s
         JOIN students st ON st.student_id = s.student_id
         WHERE s.alumni_id = ?
         ORDER BY s.created_at DESC"
    );
    $stmt->execute([$session["id"]]);
}

$rows = $stmt->fetchAll();
$result = array_map(function ($row) use ($session) {
    $item = [
        "id" => (int) $row["session_id"],
        "studentId" => encode_id("student", $row["student_id"]),
        "alumniId" => encode_id("alumni", $row["alumni_id"]),
        "date" => $row["session_date"],
        "time" => substr($row["start_time"], 0, 5),
        "duration" => minutes_between($row["start_time"], $row["end_time"]),
        "message" => $row["message"],
        "status" => $row["status"],
        "createdAt" => $row["created_at"]
    ];
    if ($session["role"] === "student") {
        $item["alumniName"] = $row["other_name"];
        $item["alumniCompany"] = $row["other_company"] ?? "";
    } else {
        $item["studentName"] = $row["other_name"];
        $item["studentDepartment"] = $row["other_department"] ?? "";
    }
    return $item;
}, $rows);

send_success("", $result);

function minutes_between($start, $end)
{
    $s = strtotime($start);
    $e = strtotime($end);
    return (int) round(($e - $s) / 60);
}
