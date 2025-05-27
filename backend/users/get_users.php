<?php
require_once '../auth_middleware.php';
require_once '../db.php'; //

header('Content-Type: application/json');

// Verificar token JWT
$userData = checkAuth();

// Solo admin puede ver la lista de usuarios
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Conexión segura
$conn = getDBConnection(); 

$result = $conn->query("SELECT id, first_name, last_name, email, username, image, role, created_at FROM users");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "success" => true,
    "users" => $users
]);