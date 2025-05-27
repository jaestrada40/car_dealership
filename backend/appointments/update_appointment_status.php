<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden actualizar citas"]);
    exit;
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$id = intval($data['id']);
$status = strtolower(trim($data['status']));

// Validar estado permitido
$allowed = ['pendiente', 'confirmada', 'cancelada'];
if (!in_array($status, $allowed)) {
    echo json_encode(["success" => false, "message" => "Estado inválido"]);
    exit;
}

$conn = getDBConnection();

// Verificar existencia de la cita
$check = $conn->prepare("SELECT id FROM appointments WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Cita no encontrada"]);
    exit;
}

// Actualizar estado
$stmt = $conn->prepare("UPDATE appointments SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Estado de cita actualizado a '$status'"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar la cita", "error" => $stmt->error]);
}
