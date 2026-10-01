<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();

$name = input_str($input, "name");
$company = input_str($input, "company");
$jobTitle = input_str($input, "jobTitle");
$skills = input_str($input, "skills");
$bio = input_str($input, "bio");

if ($name === "") {
    send_error("Name cannot be empty.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare(
    "UPDATE alumni SET name = ?, company = ?, job_title = ?, skills = ?, bio = ? WHERE alumni_id = ?"
);
$stmt->execute([$name, $company, $jobTitle, $skills, $bio, $session["id"]]);

$user = get_current_user_profile($pdo);
send_success("Profile updated successfully.", $user);
