<?php
/**
 * response.php
 * Small helpers used by every API endpoint so responses are
 * consistent JSON objects with the correct HTTP status code.
 */

header("Content-Type: application/json");

function send_json($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function send_success($message = "", $data = null, $statusCode = 200)
{
    $payload = ["success" => true, "message" => $message];
    if ($data !== null) {
        $payload["data"] = $data;
    }
    send_json($payload, $statusCode);
}

function send_error($message = "Something went wrong", $statusCode = 400)
{
    send_json(["success" => false, "message" => $message], $statusCode);
}

/**
 * Reads and decodes a JSON request body sent via fetch().
 * Returns an empty array if the body is missing or invalid.
 */
function get_json_input()
{
    $raw = file_get_contents("php://input");
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Trims a value from an input array and returns "" if missing.
 */
function input_str($input, $key)
{
    return isset($input[$key]) ? trim((string) $input[$key]) : "";
}
