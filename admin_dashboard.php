<?php
session_start();
require_once 'config.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin_login.php');
    exit();
}

// Handle certificate search
$search_results = [];
if (isset($_GET['search_query'])) {
    $search_query = '%' . $_GET['search_query'] . '%';

    try {
        $sql = "SELECT * FROM certificates WHERE certificate_id LIKE :query OR student_name LIKE :query OR course_name LIKE :query";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':query' => $search_query]);
        $search_results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $error = "Database error: " . $e->getMessage();
    }
}

// Handle certificate deletion
if (isset($_GET['delete_id'])) {
    try {
        $sql = "DELETE FROM certificates WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $_GET['delete_id']]);

        header('Location: admin_dashboard.php?message=certificate_deleted');
        exit();
    } catch (PDOException $e) {
        $error = "Database error: " . $e->getMessage();
    }
}

// Fetch all certificates
try {
    $sql = "SELECT * FROM certificates ORDER BY issued_date DESC";
    $stmt = $pdo->query($sql);
    $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $error = "Database error: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - WEBINA Digital</title>
    <!-- Include your CSS and JavaScript here -->
</head>

<body>
    <!-- Admin dashboard HTML content -->
    <?php if (isset($error)): ?>
        <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <!-- Display certificates in a table -->
    <table>
        <thead>
            <tr>
                <th>Certificate ID</th>
                <th>Student Name</th>
                <th>Course Name</th>
                <th>Issue Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($certificates as $certificate): ?>
                <tr>
                    <td><?php echo htmlspecialchars($certificate['certificate_id']); ?></td>
                    <td><?php echo htmlspecialchars($certificate['student_name']); ?></td>
                    <td><?php echo htmlspecialchars($certificate['course_name']); ?></td>
                    <td><?php echo htmlspecialchars($certificate['issued_date']); ?></td>
                    <td>
                        <a href="edit_certificate.php?id=<?php echo $certificate['id']; ?>">Edit</a>
                        <a href="admin_dashboard.php?delete_id=<?php echo $certificate['id']; ?>" onclick="return confirm('Are you sure?')">Delete</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>

</html>