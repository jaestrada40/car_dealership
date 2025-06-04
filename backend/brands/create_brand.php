<?php
require_once '../auth_middleware.php';
require_once '../db.php';

header('Content-Type: application/json');

$userData = checkAuth();

// Solo admin puede crear marcas
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Leer el cuerpo de la solicitud (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || empty(trim($data['name']))) {
    echo json_encode(["success" => false, "message" => "El nombre es obligatorio"]);
    exit;
}

$name = htmlspecialchars(trim($data['name']));
$image = null;

// Verificar si se envió un archivo
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newName = uniqid('brand_') . '.' . $ext;
    $uploadDir = '../../uploads/brands/';
    $uploadPath = $uploadDir . $newName;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
        $image = $newName;
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir imagen"]);
        exit;
    }
} elseif (isset($data['image'])) {
    $image = $data['image'];
}

// Obtener conexión
$conn = getDBConnection();

// Validar si ya existe
$check = $conn->prepare("SELECT id FROM brands WHERE name = ?");
$check->bind_param("s", $name);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "La marca ya existe"]);
    exit;
}

// Insertar
$stmt = $conn->prepare("INSERT INTO brands (name, image) VALUES (?, ?)");
$stmt->bind_param("ss", $name, $image);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Marca registrada exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al guardar la marca"]);
}