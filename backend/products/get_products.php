<?php
require_once '../auth_middleware.php';
require_once '../db.php';

header('Content-Type: application/json');

$userData = checkAuth();

if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

$conn = getDBConnection();

$result = $conn->query("SELECT p.id, p.name, p.description, p.price, p.stock, p.brand_id, p.image, b.name as brand_name 
                        FROM products p 
                        LEFT JOIN brands b ON p.brand_id = b.id");

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode([
    "success" => true,
    "products" => $products
]);

$conn->close();
?>