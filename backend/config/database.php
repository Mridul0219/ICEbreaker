<?php
/**
 * database.php
 * Creates and returns a single reusable PDO connection to the
 * alumni_bridge MySQL database. Uses prepared statements everywhere
 * this connection is used (see backend/api/**).
 */

function get_db_connection()
{
    $host = "localhost";
    $dbname = "alumni_bridge";
    $username = "root";
    $password = ""; // default empty XAMPP password

    try {
        $pdo = new PDO(
            "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
            $username,
            $password
        );
        // Throw exceptions on errors instead of silently failing
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        // Never leak DB credentials/details to the client
        http_response_code(500);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => false,
            "message" => "Database connection failed. Please make sure MySQL is running and the alumni_bridge database has been imported."
        ]);
        exit;
    }
}
