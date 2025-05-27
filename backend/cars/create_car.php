<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Validar campos
$required = ['brand_id', 'model', 'year', 'price', 'fuel_type', 'transmission'];
foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        echo json_encode(["success" => false, "message" => "Campo obligatorio faltante: $field"]);
        exit;
    }
}

$brand_id     = intval($_POST['brand_id']);
$model        = htmlspecialchars(trim($_POST['model']));
$year         = intval($_POST['year']);
$price        = floatval($_POST['price']);
$color        = isset($_POST['color']) ? htmlspecialchars(trim($_POST['color'])) : null;
$mileage      = isset($_POST['mileage']) ? intval($_POST['mileage']) : null;
$fuel_type    = htmlspecialchars(trim($_POST['fuel_type']));
$transmission = htmlspecialchars(trim($_POST['transmission']));
$description  = isset($_POST['description']) ? htmlspecialchars(trim($_POST['description'])) : null;

// Subir imagen (opcional)
$image = null;
$image_url = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newName = uniqid('car_') . '.' . $ext;

    $uploadDir = __DIR__ . '/../../uploads/cars/';
    $publicUrl = 'http://localhost/car_dealership/uploads/cars/' . $newName;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $newName)) {
        $image = $newName;
        $image_url = $publicUrl;
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir la imagen del carro"]);
        exit;
    }
}

// Conexión usando función
$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO cars (brand_id, model, year, price, color, mileage, fuel_type, transmission, image, description)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("isidisssss", $brand_id, $model, $year, $price, $color, $mileage, $fuel_type, $transmission, $image, $description);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Vehículo registrado correctamente",
        "image_url" => $image_url
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al registrar el vehículo",
        "error" => $stmt->error
    ]);
}
