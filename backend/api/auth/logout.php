<?php
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/session_helper.php";

$_SESSION = [];
session_destroy();

send_success("Logged out successfully.");
