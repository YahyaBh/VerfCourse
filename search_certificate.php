<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $certificate_id = $_POST['certificate_id'] ?? '';
    $student_name = $_POST['student_name'] ?? '';

    try {
        $sql = "SELECT * FROM certificates WHERE certificate_id = :certificate_id OR student_name LIKE :student_name";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':certificate_id' => $certificate_id,
            ':student_name' => '%' . $student_name . '%'
        ]);

        $certificate = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($certificate) {
            // Certificate found
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'success',
                'data' => $certificate
            ]);
        } else {
            // Certificate not found
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Certificate not found'
            ]);
        }
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
