<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden eliminar citas"]);
    exit;
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);

$conn = getDBConnection();

// Verificar existencia
$check = $conn->prepare("SELECT id FROM appointments WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Cita no encontrada"]);
    exit;
}

// Eliminar cita
$stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cita eliminada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar la cita", "error" => $stmt->error]);
}
