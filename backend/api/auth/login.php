<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$input = get_json_input();
$role = input_str($input, "role");
$email = strtolower(input_str($input, "email"));
$password = isset($input["password"]) ? (string) $input["password"] : "";

if (!in_array($role, ["student", "alumni"], true) || $email === "" || $password === "") {
    send_error("Invalid email, password or account type.");
}

$pdo = get_db_connection();
$table = $role === "student" ? "students" : "alumni";
$idColumn = $role === "student" ? "student_id" : "alumni_id";

$stmt = $pdo->prepare("SELECT * FROM {$table} WHERE email = ?");
$stmt->execute([$email]);
$row = $stmt->fetch();

if (!$row || !password_verify($password, $row["password"])) {
    send_error("Invalid email, password or account type.");
}

$_SESSION["role"] = $role;
$_SESSION["id"] = (int) $row[$idColumn];

$user = get_current_user_profile($pdo);
send_success("Logged in successfully.", $user);
