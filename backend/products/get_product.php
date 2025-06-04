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

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($_GET['id']);
$conn = getDBConnection();

$stmt = $conn->prepare("SELECT p.id, p.name, p.description, p.price, p.stock, p.brand_id, p.image, b.name as brand_name 
                        FROM products p 
                        LEFT JOIN brands b ON p.brand_id = b.id 
                        WHERE p.id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $product = $result->fetch_assoc();
    echo json_encode(["success" => true, "product" => $product]);
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Producto no encontrado"]);
}

$stmt->close();
$conn->close();
?>