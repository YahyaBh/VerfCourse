<?php
session_start();
require_once 'config.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin_login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_name = $_POST['student_name'] ?? '';
    $course_name = $_POST['course_name'] ?? '';
    $certificate_id = $_POST['certificate_id'] ?? '';
    $issued_date = $_POST['issued_date'] ?? date('Y-m-d');

    try {
        $sql = "INSERT INTO certificates (student_name, course_name, certificate_id, issued_date) 
                VALUES (:student_name, :course_name, :certificate_id, :issued_date)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_name' => $student_name,
            ':course_name' => $course_name,
            ':certificate_id' => $certificate_id,
            ':issued_date' => $issued_date
        ]);

        header('Location: admin_dashboard.php?message=certificate_added');
        exit();
    } catch (PDOException $e) {
        $error = "Database error: " . $e->getMessage();
    }
}
?>

<!-- HTML form for adding a new certificate -->