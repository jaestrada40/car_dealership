<?php
require_once '../auth_middleware.php';
require_once '../db.php'; //

header('Content-Type: application/json');

// Verificar token JWT
$userData = checkAuth();

// Validar parámetro ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID inválido o no proporcionado"]);
    exit;
}

$id = intval($_GET['id']);

// Solo el mismo usuario o un admin puede ver la información
if ($userData['role'] !== 'admin' && $userData['sub'] != $id) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Obtener conexión
$conn = getDBConnection();

// Buscar usuario
$stmt = $conn->prepare("SELECT id, first_name, last_name, email, username, image, role, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    echo json_encode(["success" => true, "user" => $user]);
} else {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
