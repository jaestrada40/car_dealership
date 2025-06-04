<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$userData = checkAuth();

// Solo admin puede eliminar usuarios
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar ID
if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);

// Prevenir que un admin se elimine a sí mismo
if ($userData['sub'] == $id) {
    echo json_encode(["success" => false, "message" => "No puedes eliminar tu propio usuario"]);
    exit;
}

// Obtener conexión
$conn = getDBConnection();

// Verificar que el usuario exista
$check = $conn->prepare("SELECT id FROM users WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

// Eliminar usuario
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar usuario", "error" => $stmt->error]);
}
