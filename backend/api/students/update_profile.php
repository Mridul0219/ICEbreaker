<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("student");
$input = get_json_input();

$name = input_str($input, "name");
$department = input_str($input, "department");
$skills = input_str($input, "skills");
$cvLink = input_str($input, "cvLink");
$portfolioLink = input_str($input, "portfolioLink");

if ($name === "") {
    send_error("Name cannot be empty.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    "UPDATE students SET name = ?, department = ?, skills = ?, cv_link = ?, portfolio_link = ? WHERE student_id = ?"
);
$stmt->execute([$name, $department, $skills, $cvLink, $portfolioLink, $session["id"]]);

$user = get_current_user_profile($pdo);
send_success("Profile updated successfully.", $user);
