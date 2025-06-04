<?php
// backend/quotes/update_quote.php

require_once '../db.php';
require_once '../auth_middleware.php';

header('Content-Type: application/json');
$conn = getDBConnection();

// 1) Verificar token y rol “admin”
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['id'])) {
    echo json_encode(["success" => false, "message" => "Falta ID de cotización"]);
    exit;
}

$id = intval($input['id']);
$fields = [];
$params = [];
$types = "";

// Solo permitimos actualizar ciertos campos: status, quantity, comment
if (isset($input['status'])) {
    $fields[] = "`status` = ?";
    $types  .= "s";
    $params[] = $input['status'];
}
if (isset($input['quantity'])) {
    $fields[] = "`quantity` = ?";
    $types  .= "i";
    $params[] = intval($input['quantity']);
}
if (isset($input['comment'])) {
    $fields[] = "`comment` = ?";
    $types  .= "s";
    $params[] = $input['comment'];
}

if (count($fields) === 0) {
    echo json_encode(["success" => false, "message" => "Nada que actualizar"]);
    exit;
}

$sql = "UPDATE `quotes` SET " . implode(", ", $fields) . " WHERE `id` = ?";
$types   .= "i";
$params[] = $id;

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cotización actualizada"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();
