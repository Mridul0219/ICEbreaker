<?php
/**
 * id_helper.php
 *
 * The frontend was originally built around a single "users" list
 * where every person (student or alumni) had one id. The database
 * instead keeps students and alumni in two separate tables, each
 * with their own auto-increment id, so the same number could refer
 * to two different people.
 *
 * To avoid changing how the frontend renders things, every id sent
 * to the browser is encoded as "student:5" or "alumni:5". These
 * helpers convert between that string form and the [role, id] pair
 * used in SQL queries.
 */

function encode_id($role, $id)
{
    return $role . ":" . $id;
}

/**
 * Returns ["role" => "student"|"alumni", "id" => int] or false if
 * the string is not a valid encoded id.
 */
function decode_id($value)
{
    if (!is_string($value) || strpos($value, ":") === false) {
        return false;
    }
    list($role, $id) = explode(":", $value, 2);
    if (!in_array($role, ["student", "alumni"], true) || !ctype_digit($id)) {
        return false;
    }
    return ["role" => $role, "id" => (int) $id];
}
