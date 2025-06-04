<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$conn = getDBConnection();

$id = isset($_GET['id']) && is_numeric($_GET['id']) ? intval($_GET['id']) : null;

$sql = "SELECT id, name, description, created_at FROM categories";
if ($id) {
    $sql .= " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $sql .= " ORDER BY name ASC";
    $result = $conn->query($sql);
}

$categories = [];

while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode([
    "success" => true,
    "categories" => $categories
]);

if ($id && $stmt) $stmt->close();
$conn->close();
?>