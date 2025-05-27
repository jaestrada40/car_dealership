<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$conn = getDBConnection();

$sql = "SELECT id, name, description, created_at FROM categories ORDER BY name ASC";
$result = $conn->query($sql);

$categories = [];

while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode([
    "success" => true,
    "categories" => $categories
]);
