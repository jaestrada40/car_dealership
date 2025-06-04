<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Solo admin puede crear
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || trim($data['name']) === '') {
    echo json_encode(["success" => false, "message" => "El nombre de la categoría es obligatorio"]);
    exit;
}

$name = htmlspecialchars(trim($data['name']));
$description = isset($data['description']) ? htmlspecialchars(trim($data['description'])) : null;

$conn = getDBConnection();

// Verificar duplicado
$check = $conn->prepare("SELECT id FROM categories WHERE name = ?");
$check->bind_param("s", $name);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Ya existe una categoría con ese nombre"]);
    exit;
}

// Insertar
$stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
$stmt->bind_param("ss", $name, $description);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Categoría creada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear categoría", "error" => $stmt->error]);
}
