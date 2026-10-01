<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";
require_once __DIR__ . "/../../config/database.php";

$pdo = get_db_connection();
$user = get_current_user_profile($pdo);

if (!$user) {
    send_json(["success" => true, "data" => null]);
}

send_success("", $user);
