<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Leer datos JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validar ID del auto
if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["success" => false, "message" => "ID del vehículo inválido"]);
    exit;
}

$id           = intval($data['id']);
$brand_id     = isset($data['brand_id']) ? intval($data['brand_id']) : null;
$model        = isset($data['model']) ? htmlspecialchars(trim($data['model'])) : null;
$year         = isset($data['year']) ? intval($data['year']) : null;
$price        = isset($data['price']) ? floatval($data['price']) : null;
$color        = isset($data['color']) ? htmlspecialchars(trim($data['color'])) : null;
$mileage      = isset($data['mileage']) ? intval($data['mileage']) : null;
$fuel_type    = isset($data['fuel_type']) ? htmlspecialchars(trim($data['fuel_type'])) : null;
$transmission = isset($data['transmission']) ? htmlspecialchars(trim($data['transmission'])) : null;
$description  = isset($data['description']) ? htmlspecialchars(trim($data['description'])) : null;
$status       = isset($data['status']) ? $data['status'] : 'disponible';
$image        = isset($data['image']) ? $data['image'] : null;

// Conexión
$conn = getDBConnection();

// Verificar que exista
$check = $conn->prepare("SELECT image FROM cars WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Vehículo no encontrado"]);
    exit;
}

// Actualizar
$stmt = $conn->prepare("UPDATE cars SET 
    brand_id = ?, model = ?, year = ?, price = ?, color = ?, mileage = ?, 
    fuel_type = ?, transmission = ?, image = ?, description = ?, status = ?
    WHERE id = ?");

$stmt->bind_param(
    "isidissssssi",
    $brand_id, $model, $year, $price, $color, $mileage,
    $fuel_type, $transmission, $image, $description, $status, $id
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Vehículo actualizado correctamente",
        "image_url" => $image
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar vehículo",
        "error" => $stmt->error
    ]);
}