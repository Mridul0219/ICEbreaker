<?php
/**
 * session_helper.php
 * Wraps PHP sessions so every endpoint can easily find out who is
 * logged in (if anyone) and require a role before running.
 */

require_once __DIR__ . "/response.php";
require_once __DIR__ . "/id_helper.php";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function current_session()
{
    if (!isset($_SESSION["role"], $_SESSION["id"])) {
        return null;
    }
    return ["role" => $_SESSION["role"], "id" => (int) $_SESSION["id"]];
}

/**
 * Ends the request with a 401 JSON error if nobody is logged in.
 * Otherwise returns ["role" => ..., "id" => ...].
 */
function require_login()
{
    $session = current_session();
    if (!$session) {
        send_error("You must be logged in to do this.", 401);
    }
    return $session;
}

/**
 * Like require_login() but also checks the logged-in user has the
 * given role ("student" or "alumni").
 */
function require_role($role)
{
    $session = require_login();
    if ($session["role"] !== $role) {
        send_error("This action is only available to " . $role . " accounts.", 403);
    }
    return $session;
}

/**
 * Loads the full profile row for the current session user from the
 * database and returns it in the shape the frontend expects
 * (matching the fields the original localStorage "user" object had).
 */
function get_current_user_profile($pdo)
{
    $session = current_session();
    if (!$session) {
        return null;
    }

    if ($session["role"] === "student") {
        $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = ?");
        $stmt->execute([$session["id"]]);
        $row = $stmt->fetch();
        if (!$row) return null;
        return [
            "id" => encode_id("student", $row["student_id"]),
            "role" => "student",
            "name" => $row["name"],
            "email" => $row["email"],
            "department" => $row["department"] ?? "",
            "skills" => $row["skills"] ?? "",
            "cvLink" => $row["cv_link"] ?? "",
            "portfolioLink" => $row["portfolio_link"] ?? "",
            "createdAt" => $row["created_at"]
        ];
    } else {
        $stmt = $pdo->prepare("SELECT * FROM alumni WHERE alumni_id = ?");
        $stmt->execute([$session["id"]]);
        $row = $stmt->fetch();
        if (!$row) return null;
        return [
            "id" => encode_id("alumni", $row["alumni_id"]),
            "role" => "alumni",
            "name" => $row["name"],
            "email" => $row["email"],
            "company" => $row["company"] ?? "",
            "jobTitle" => $row["job_title"] ?? "",
            "skills" => $row["skills"] ?? "",
            "bio" => $row["bio"] ?? "",
            "portfolioLink" => $row["portfolio_link"] ?? "",
            "createdAt" => $row["created_at"]
        ];
    }
}
