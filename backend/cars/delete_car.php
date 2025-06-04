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

// Obtener datos
$data = json_decode(file_get_contents("php://input"), true);

// Validar ID
if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);

// Conexión
$conn = getDBConnection();

// Verificar existencia
$check = $conn->prepare("SELECT image FROM cars WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Vehículo no encontrado"]);
    exit;
}

$row = $result->fetch_assoc();

// Eliminar imagen del servidor (opcional)
if ($row['image']) {
    $filePath = __DIR__ . '/../../uploads/cars/' . $row['image'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

// Eliminar registro
$stmt = $conn->prepare("DELETE FROM cars WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Vehículo eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar el vehículo", "error" => $stmt->error]);
}
