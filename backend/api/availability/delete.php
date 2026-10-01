<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$session = require_role("alumni");
$input = get_json_input();
$id = isset($input["id"]) ? (int) $input["id"] : 0;

if ($id <= 0) {
    send_error("Invalid slot id.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("DELETE FROM availability WHERE availability_id = ? AND alumni_id = ?");
$stmt->execute([$id, $session["id"]]);

if ($stmt->rowCount() === 0) {
    send_error("Slot not found.", 404);
}

send_success("Slot removed.");
