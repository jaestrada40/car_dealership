<?php
// backend/quotes/delete_quote.php

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

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "ID no válido"]);
    exit;
}

$sql = "DELETE FROM `quotes` WHERE `id` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cotización eliminada"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();
