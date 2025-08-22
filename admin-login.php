<?php
require_once 'config.php';

// Check if user is already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: admin-dashboard.php');
    exit();
}

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize input data
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';

    // Validate inputs
    $errors = [];

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Valid email address is required.";
    }

    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    // If there are errors, redirect back with errors
    if (!empty($errors)) {
        $_SESSION['errors'] = $errors;
        header('Location: admin-login.html');
        exit();
    }

    try {
        // Prepare SQL query
        $sql = "SELECT * FROM admin_users WHERE email = :email";
        $stmt = $pdo->prepare($sql);

        // Bind parameters
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);

        // Execute query
        $stmt->execute();

        // Fetch result
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password'])) {
            // Login successful - set session variables
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];

            // Redirect to dashboard
            header('Location: admin-dashboard.php');
            exit();
        } else {
            // Login failed
            $_SESSION['error'] = "Invalid email or password.";
            header('Location: admin-login.html');
            exit();
        }
    } catch (PDOException $e) {
        // Log error and display user-friendly message
        error_log("Database error: " . $e->getMessage());
        $_SESSION['error'] = "An error occurred during login. Please try again later.";
        header('Location: admin-login.html');
        exit();
    }
} else {
    // If someone tries to access this page directly
    header('Location: admin-login.html');
    exit();
}
