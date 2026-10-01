<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/id_helper.php";
require_once __DIR__ . "/../../config/database.php";

$input = get_json_input();

$role = input_str($input, "role");
$name = input_str($input, "name");
$email = strtolower(input_str($input, "email"));
$password = isset($input["password"]) ? (string) $input["password"] : "";
$confirmPassword = isset($input["confirmPassword"]) ? (string) $input["confirmPassword"] : "";

if (!in_array($role, ["student", "alumni"], true)) {
    send_error("Please choose a valid account type.");
}
if ($name === "" || $email === "" || $password === "") {
    send_error("Please fill in all required fields.");
}
if ($password !== $confirmPassword) {
    send_error("Passwords do not match.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_error("Please enter a valid email address.");
}

$pdo = get_db_connection();
$table = $role === "student" ? "students" : "alumni";

$check = $pdo->prepare("SELECT " . ($role === "student" ? "student_id" : "alumni_id") . " FROM {$table} WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    send_error("An account with this email already exists.");
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

if ($role === "student") {
    $stmt = $pdo->prepare("INSERT INTO students (name, email, password) VALUES (?, ?, ?)");
} else {
    $stmt = $pdo->prepare("INSERT INTO alumni (name, email, password) VALUES (?, ?, ?)");
}
$stmt->execute([$name, $email, $hashedPassword]);

send_success("Account created successfully.");
