<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_login();
$pdo = get_db_connection();

if ($session["role"] === "student") {
    $stmt = $pdo->prepare(
        "SELECT r.*, a.name AS other_name
         FROM referral_requests r
         JOIN alumni a ON a.alumni_id = r.alumni_id
         WHERE r.student_id = ?
         ORDER BY r.created_at DESC"
    );
    $stmt->execute([$session["id"]]);
} else {
    $stmt = $pdo->prepare(
        "SELECT r.*, st.name AS other_name, st.department AS other_department
         FROM referral_requests r
         JOIN students st ON st.student_id = r.student_id
         WHERE r.alumni_id = ?
         ORDER BY r.created_at DESC"
    );
    $stmt->execute([$session["id"]]);
}

$rows = $stmt->fetchAll();
$result = array_map(function ($row) use ($session) {
    $item = [
        "id" => (int) $row["referral_id"],
        "studentId" => encode_id("student", $row["student_id"]),
        "alumniId" => encode_id("alumni", $row["alumni_id"]),
        "company" => $row["company"],
        "position" => $row["position"],
        "cvLink" => $row["cv_link"],
        "portfolioLink" => $row["portfolio_link"] ?? "",
        "message" => $row["message"],
        "status" => $row["status"],
        "proofNote" => $row["proof_note"] ?? "",
        "proofLink" => $row["proof_link"] ?? "",
        "createdAt" => $row["created_at"]
    ];
    if ($session["role"] === "student") {
        $item["alumniName"] = $row["other_name"];
    } else {
        $item["studentName"] = $row["other_name"];
        $item["studentDepartment"] = $row["other_department"] ?? "";
    }
    return $item;
}, $rows);

send_success("", $result);
