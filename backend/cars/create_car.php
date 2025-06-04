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

// Validar campos
$required = ['brand_id', 'model', 'year', 'price', 'fuel_type', 'transmission'];
foreach ($required as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        echo json_encode(["success" => false, "message" => "Campo obligatorio faltante: $field"]);
        exit;
    }
}

$brand_id     = intval($data['brand_id']);
$model        = htmlspecialchars(trim($data['model']));
$year         = intval($data['year']);
$price        = floatval($data['price']);
$color        = isset($data['color']) ? htmlspecialchars(trim($data['color'])) : null;
$mileage      = isset($data['mileage']) ? intval($data['mileage']) : null;
$fuel_type    = htmlspecialchars(trim($data['fuel_type']));
$transmission = htmlspecialchars(trim($data['transmission']));
$description  = isset($data['description']) ? htmlspecialchars(trim($data['description'])) : null;

// Usar la imagen proporcionada por el frontend (si existe)
$image = isset($data['image']) ? $data['image'] : null;

// Conexión usando función
$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO cars (brand_id, model, year, price, color, mileage, fuel_type, transmission, image, description)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("isidisssss", $brand_id, $model, $year, $price, $color, $mileage, $fuel_type, $transmission, $image, $description);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Vehículo registrado correctamente",
        "image_url" => $image
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al registrar el vehículo",
        "error" => $stmt->error
    ]);
}