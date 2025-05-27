<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden eliminar repuestos"]);
    exit;
}

// Leer JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);
$conn = getDBConnection();

// Verificar existencia y obtener imagen
$check = $conn->prepare("SELECT image FROM spare_parts WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Repuesto no encontrado"]);
    exit;
}

$row = $res->fetch_assoc();
$image = $row['image'];

// Eliminar imagen si existe
if ($image) {
    $imagePath = __DIR__ . '/../../uploads/spare_parts/' . $image;
    if (file_exists($imagePath)) {
        unlink($imagePath);
    }
}

// Eliminar repuesto
$stmt = $conn->prepare("DELETE FROM spare_parts WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Repuesto eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar repuesto", "error" => $stmt->error]);
}
