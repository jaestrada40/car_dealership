<?php
//require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Validar ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($_GET['id']);

// Conexión
$conn = getDBConnection();

$sql = "SELECT 
            cars.id,
            cars.brand_id,
            brands.name AS brand_name,
            cars.model,
            cars.year,
            cars.price,
            cars.color,
            cars.mileage,
            cars.fuel_type,
            cars.transmission,
            cars.image,
            cars.description,
            cars.status,
            cars.created_at
        FROM cars
        JOIN brands ON cars.brand_id = brands.id
        WHERE cars.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Vehículo no encontrado"]);
    exit;
}

$row = $result->fetch_assoc();

// Usar la imagen tal como está en la base de datos
$row['image_url'] = $row['image'] ?: null;

echo json_encode([
    "success" => true,
    "car" => $row
]);