<?php
header('Content-Type: application/json');

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

// Verificar token
$userData = checkAuth();
if (!$userData) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No se proporcionó una imagen"]);
    exit;
}

$uploadDir = __DIR__ . "/../uploads/";
$allowedFolders = ['users', 'spare_parts', 'brands']; // Añadido 'brands'
$folder = isset($_POST['folder']) && in_array($_POST['folder'], $allowedFolders) ? $_POST['folder'] : 'spare_parts';
$uploadDir .= $folder . '/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$image = $_FILES['image'];
$imageName = uniqid() . '.' . pathinfo($image['name'], PATHINFO_EXTENSION);
$uploadPath = $uploadDir . $imageName;

if (move_uploaded_file($image['tmp_name'], $uploadPath)) {
    // Generar la URL relativa al archivo, sin incluir el prefijo completo dos veces
    $imagePath = "/car_dealership/uploads/" . $folder . '/' . $imageName;
    echo json_encode(["success" => true, "image_path" => $imagePath]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al subir la imagen"]);
}
?>