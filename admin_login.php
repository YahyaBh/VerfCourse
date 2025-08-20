<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    try {
        $sql = "SELECT * FROM admin_users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($password, $admin['password'])) {
            // Login successful
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];

            header('Location: admin_dashboard.php');
            exit();
        } else {
            // Login failed
            header('Location: admin_login.php');
            exit();
        }
    } catch (PDOException $e) {
        header('Location: admin_login.php?error=database_error');
        exit();
    }
}
