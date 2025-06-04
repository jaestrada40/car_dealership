<?php
// backend/users/update_password.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Verificar token
$userData = checkAuth();
$userId   = intval($userData['sub']);

// 2) Leer body JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['new_password']) || trim($data['new_password']) === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Nueva contraseña requerida"]);
    exit;
}

$newPassword = trim($data['new_password']);
if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 8 caracteres"]);
    exit;
}

$conn = getDBConnection();
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $hashedPassword, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Contraseña actualizada correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al actualizar la contraseña"]);
}

$stmt->close();
$conn->close();
