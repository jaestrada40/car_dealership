<?php
// backend/users/update_user.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Validar token y obtener payload
$userData     = checkAuth();
$loggedInId   = intval($userData['sub']);
$loggedInRole = $userData['role'];

// 2) Leer body JSON
$data = json_decode(file_get_contents("php://input"), true);

// 3) Validar que venga “id” correcto
if (!isset($data['id']) || !is_numeric($data['id']) || intval($data['id']) <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}
$targetId = intval($data['id']);

// 4) Permisos: 
//    - Si rol != 'admin', solo puede actualizarse a sí mismo
if ($loggedInRole !== 'admin' && $loggedInId !== $targetId) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "No tienes permiso para actualizar este usuario"
    ]);
    exit;
}

// 5) Validar campos obligatorios
if (
    !isset($data['first_name']) || trim($data['first_name']) === '' ||
    !isset($data['last_name'])  || trim($data['last_name']) === ''  ||
    !isset($data['email'])      || trim($data['email']) === ''      ||
    !isset($data['username'])   || trim($data['username']) === ''   ||
    !isset($data['role'])       || !in_array($data['role'], ['client','admin'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

// 6) Sanitizar entradas
$user_id    = $targetId;
$first_name = htmlspecialchars(trim($data['first_name']));
$last_name  = htmlspecialchars(trim($data['last_name']));
$email      = htmlspecialchars(trim($data['email']));
$username   = htmlspecialchars(trim($data['username']));
$role       = $data['role'];
$image      = isset($data['image']) && trim($data['image']) !== ''
               ? htmlspecialchars(trim($data['image']))
               : null;
$password   = (isset($data['password']) && trim($data['password']) !== '')
               ? password_hash($data['password'], PASSWORD_DEFAULT)
               : null;

$conn = getDBConnection();

// 7) Verificar que el usuario exista
$checkStmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
$checkStmt->bind_param("i", $user_id);
$checkStmt->execute();
$checkStmt->store_result();
if ($checkStmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}
$checkStmt->close();

// 8) Armar el SQL dinámico
$query  = "UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, role = ?";
$params = [$first_name, $last_name, $email, $username, $role];
$types  = "sssss";

if ($password !== null) {
    $query   .= ", password = ?";
    $types   .= "s";
    $params[] = $password;
}

if ($image !== null) {
    $query   .= ", image = ?";
    $types   .= "s";
    $params[] = $image;
}

$query   .= " WHERE id = ?";
$types   .= "i";
$params[] = $user_id;

$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario actualizado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar usuario",
        "error"   => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
