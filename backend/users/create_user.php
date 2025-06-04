<?php
//require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

// Validar datos
if (
    !isset($data['first_name']) || trim($data['first_name']) === '' ||
    !isset($data['last_name'])  || trim($data['last_name'])  === '' ||
    !isset($data['email'])      || trim($data['email'])      === '' ||
    !isset($data['username'])   || trim($data['username'])   === '' ||
    !isset($data['password'])   || trim($data['password'])   === '' ||
    !isset($data['role'])       || !in_array($data['role'], ['client', 'admin'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$first_name = htmlspecialchars(trim($data['first_name']));
$last_name  = htmlspecialchars(trim($data['last_name']));
$email      = htmlspecialchars(trim($data['email']));
$username   = htmlspecialchars(trim($data['username']));
$password   = password_hash($data['password'], PASSWORD_DEFAULT);
$role       = $data['role'];

// Aquí asignamos la imagen por defecto si no viene en el JSON
if (isset($data['image']) && trim($data['image']) !== '') {
    $image = htmlspecialchars(trim($data['image']));
} else {
    // Ruta relativa dentro de tu servidor; ajústala si lo guardas en otro directorio
    $image = "/car_dealership/uploads/users/default_avatar.png";
}

$conn = getDBConnection();

// Verificar si el email o username ya existen
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$checkStmt->bind_param("ss", $email, $username);
$checkStmt->execute();
$checkStmt->store_result();
if ($checkStmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El email o username ya está en uso"]);
    exit;
}

// Insertar usuario (incluyendo la columna `image`, que ahora siempre tendrá un valor)
$stmt = $conn->prepare(
    "INSERT INTO users (first_name, last_name, email, username, password, role, image)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param(
    "sssssss",
    $first_name,
    $last_name,
    $email,
    $username,
    $password,
    $role,
    $image
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario creado correctamente"]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear usuario",
        "error"   => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
