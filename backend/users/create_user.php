<?php
require_once '../auth_middleware.php';
require_once '../db.php';

header('Content-Type: application/json');

$userData = checkAuth();

// Solo admin
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Conexión segura
$conn = getDBConnection(); 

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['first_name'], $data['last_name'], $data['email'],
    $data['username'], $data['password'], $data['role']) ||
    empty($data['first_name']) || empty($data['last_name']) || empty($data['email']) ||
    empty($data['username']) || empty($data['password'])
) {
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
    exit;
}

$first_name = htmlspecialchars(trim($data['first_name']));
$last_name = htmlspecialchars(trim($data['last_name']));
$email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
$username = htmlspecialchars(trim($data['username']));
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = ($data['role'] === 'admin') ? 'admin' : 'client';
$image = isset($data['image']) ? htmlspecialchars(trim($data['image'])) : null;

// Verificar duplicados
$check = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$check->bind_param("ss", $email, $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Correo o usuario ya registrados"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, username, password, image, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $first_name, $last_name, $email, $username, $password, $image, $role);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario creado exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear usuario", "error" => $stmt->error]);
}
