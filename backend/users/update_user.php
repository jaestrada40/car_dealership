<?php
require_once '../auth_middleware.php';
require_once '../db.php'; //

header('Content-Type: application/json');

$userData = checkAuth(); // JWT verificado

$data = json_decode(file_get_contents("php://input"), true);

// Validar que haya ID
if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($data['id']);

// Solo el mismo usuario o un admin puede modificar
if ($userData['role'] !== 'admin' && $userData['sub'] != $id) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Campos permitidos para actualizar
$allowedFields = ['first_name', 'last_name', 'email', 'username', 'password', 'image'];
if ($userData['role'] === 'admin') {
    $allowedFields[] = 'role'; // solo admin puede cambiar el rol
}

$fields = [];
$params = [];
$types = "";

// Generar UPDATE dinámico
foreach ($allowedFields as $field) {
    if (isset($data[$field]) && $field !== 'password') {
        $fields[] = "$field = ?";
        $params[] = htmlspecialchars(trim($data[$field]));
        $types .= "s";
    } elseif ($field === 'password' && !empty($data['password'])) {
        $fields[] = "password = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        $types .= "s";
    }
}

if (empty($fields)) {
    echo json_encode(["success" => false, "message" => "No hay datos para actualizar"]);
    exit;
}

$params[] = $id;
$types .= "i";

$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}
