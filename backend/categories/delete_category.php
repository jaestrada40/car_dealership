<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token y rol
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden eliminar categorías"]);
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

// Verificar si tiene repuestos relacionados
$checkParts = $conn->prepare("SELECT id FROM spare_parts WHERE category_id = ?");
$checkParts->bind_param("i", $id);
$checkParts->execute();
$res = $checkParts->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "No se puede eliminar la categoría porque tiene repuestos asignados"]);
    exit;
}

// Eliminar categoría
$stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Categoría eliminada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar categoría", "error" => $stmt->error]);
}
