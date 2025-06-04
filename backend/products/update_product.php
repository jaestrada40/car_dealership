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

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);
$allowedFields = ['name', 'description', 'price', 'stock', 'brand_id', 'image'];
$fields = [];
$params = [];
$types = "";

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $fields[] = "$field = ?";
        if ($field === 'price') {
            $params[] = floatval($data[$field]);
            $types .= "d";
        } elseif ($field === 'stock' || $field === 'brand_id') {
            $params[] = intval($data[$field]);
            $types .= "i";
        } else {
            $params[] = htmlspecialchars(trim($data[$field]));
            $types .= "s";
        }
    }
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No hay datos para actualizar"]);
    exit;
}

$params[] = $id;
$types .= "i";

$conn = getDBConnection();
$sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Producto actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar producto", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>