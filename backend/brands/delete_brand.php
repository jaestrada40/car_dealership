<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

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

// Conexión
$conn = getDBConnection();

// Verificar si la marca existe
$check = $conn->prepare("SELECT image FROM brands WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Marca no encontrada"]);
    exit;
}

$row = $result->fetch_assoc();
$image = $row['image'];

// Verificar si hay autos que usan esta marca
$checkCars = $conn->prepare("SELECT id FROM cars WHERE brand_id = ?");
$checkCars->bind_param("i", $id);
$checkCars->execute();
$carsResult = $checkCars->get_result();

if ($carsResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "No se puede eliminar la marca porque tiene autos relacionados"]);
    exit;
}

// Eliminar imagen
$uploadDir = __DIR__ . '/../../uploads/brands/';
if ($image && file_exists($uploadDir . $image)) {
    unlink($uploadDir . $image);
}

// Eliminar marca
$stmt = $conn->prepare("DELETE FROM brands WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Marca eliminada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar marca", "error" => $stmt->error]);
}
