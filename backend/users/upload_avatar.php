<?php
// backend/users/upload_avatar.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

// 1) Verificar token (y decodificar payload si lo necesitas)
$userData = checkAuth(); 
// Si no hay token o es inválido, checkAuth() retorna 401 + JSON y hace exit.

// 2) Validar que se recibió el archivo 'avatar'
if (!isset($_FILES['avatar'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No se recibió ningún archivo."]);
    exit;
}

// 3) Directorio donde guardaremos los avatares
$uploadDir = __DIR__ . '/../../uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$tmpName      = $_FILES['avatar']['tmp_name'];
$originalName = basename($_FILES['avatar']['name']);
$extension    = pathinfo($originalName, PATHINFO_EXTENSION);
$newFilename  = uniqid('avatar_') . "." . $extension;
$destPath     = $uploadDir . $newFilename;

if (move_uploaded_file($tmpName, $destPath)) {
    // Armamos la ruta relativa que luego guardaremos en la BD
    $relativePath = "/car_dealership/uploads/avatars/" . $newFilename;
    echo json_encode([
        "success"    => true,
        "image_path" => $relativePath
    ]);
    exit;
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al mover el archivo."]);
    exit;
}
