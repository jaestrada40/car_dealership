<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar autenticación
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['id']) || !is_numeric($data['id']) ||
    !isset($data['status']) || trim($data['status']) === ''
) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$id = intval($data['id']);
$status = strtolower(trim($data['status']));

$validStatuses = ['pendiente', 'pagado', 'cancelado'];
if (!in_array($status, $validStatuses)) {
    echo json_encode(["success" => false, "message" => "Estado no válido"]);
    exit;
}

$conn = getDBConnection();

// Verificar existencia del pedido
$check = $conn->prepare("SELECT id FROM orders WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
    exit;
}

// Actualizar estado
$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Estado actualizado a '$status'"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar estado", "error" => $stmt->error]);
}
