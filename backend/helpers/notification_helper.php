<?php
/**
 * notification_helper.php
 * The notifications table has separate student_id / alumni_id
 * columns, so this helper picks the right column based on the
 * recipient's role and leaves the other one NULL.
 */

function add_notification($pdo, $recipientRole, $recipientId, $title, $message)
{
    if ($recipientRole === "student") {
        $stmt = $pdo->prepare(
            "INSERT INTO notifications (student_id, alumni_id, title, message) VALUES (?, NULL, ?, ?)"
        );
    } else {
        $stmt = $pdo->prepare(
            "INSERT INTO notifications (student_id, alumni_id, title, message) VALUES (NULL, ?, ?, ?)"
        );
    }
    $stmt->execute([$recipientId, $title, $message]);
}
