<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../config/database.php";

require_login(); // any logged-in user (student or alumni) may browse mentors

$pdo = get_db_connection();
$search = isset($_GET["search"]) ? trim($_GET["search"]) : "";

if ($search !== "") {
    $like = "%{$search}%";
    $stmt = $pdo->prepare(
        "SELECT * FROM alumni
         WHERE name LIKE ? OR company LIKE ? OR job_title LIKE ? OR skills LIKE ? OR bio LIKE ?
         ORDER BY name ASC"
    );
    $stmt->execute([$like, $like, $like, $like, $like]);
} else {
    $stmt = $pdo->query("SELECT * FROM alumni ORDER BY name ASC");
}

$rows = $stmt->fetchAll();
$mentors = array_map(function ($row) {
    return [
        "id" => encode_id("alumni", $row["alumni_id"]),
        "name" => $row["name"],
        "department" => $row["department"] ?? "",
        "company" => $row["company"] ?? "",
        "jobTitle" => $row["job_title"] ?? "",
        "skills" => $row["skills"] ?? "",
        "bio" => $row["bio"] ?? "",
        "email" => $row["email"]
    ];
}, $rows);

send_success("", $mentors);
