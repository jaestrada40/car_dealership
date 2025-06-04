<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar admin
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
    !isset($data['name']) || trim($data['name']) === ''
) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$id = intval($data['id']);
$name = htmlspecialchars(trim($data['name']));
$description = isset($data['description']) ? htmlspecialchars(trim($data['description'])) : null;

$conn = getDBConnection();

// Verificar que la categoría exista
$check = $conn->prepare("SELECT id FROM categories WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Categoría no encontrada"]);
    exit;
}

// Verificar duplicado (excluyendo la misma)
$duplicate = $conn->prepare("SELECT id FROM categories WHERE name = ? AND id != ?");
$duplicate->bind_param("si", $name, $id);
$duplicate->execute();
$duplicate->store_result();

if ($duplicate->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Ya existe otra categoría con ese nombre"]);
    exit;
}

// Actualizar
$stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?");
$stmt->bind_param("ssi", $name, $description, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Categoría actualizada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar categoría", "error" => $stmt->error]);
}
