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

// Validar ID del auto
if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
    echo json_encode(["success" => false, "message" => "ID del vehículo inválido"]);
    exit;
}

$id           = intval($_POST['id']);
$brand_id     = isset($_POST['brand_id']) ? intval($_POST['brand_id']) : null;
$model        = isset($_POST['model']) ? htmlspecialchars(trim($_POST['model'])) : null;
$year         = isset($_POST['year']) ? intval($_POST['year']) : null;
$price        = isset($_POST['price']) ? floatval($_POST['price']) : null;
$color        = isset($_POST['color']) ? htmlspecialchars(trim($_POST['color'])) : null;
$mileage      = isset($_POST['mileage']) ? intval($_POST['mileage']) : null;
$fuel_type    = isset($_POST['fuel_type']) ? htmlspecialchars(trim($_POST['fuel_type'])) : null;
$transmission = isset($_POST['transmission']) ? htmlspecialchars(trim($_POST['transmission'])) : null;
$description  = isset($_POST['description']) ? htmlspecialchars(trim($_POST['description'])) : null;
$status       = isset($_POST['status']) ? $_POST['status'] : 'disponible';

// Conexión
$conn = getDBConnection();

// Verificar que exista
$check = $conn->prepare("SELECT image FROM cars WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Vehículo no encontrado"]);
    exit;
}

$current = $result->fetch_assoc();
$image = $current['image'];
$image_url = $image ? 'http://localhost/car_dealership/uploads/cars/' . $image : null;

// ¿Nueva imagen?
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
        echo json_encode(["success" => false, "message" => "Error al subir imagen"]);
        exit;
    }
}

// Actualizar
$stmt = $conn->prepare("UPDATE cars SET 
    brand_id = ?, model = ?, year = ?, price = ?, color = ?, mileage = ?, 
    fuel_type = ?, transmission = ?, image = ?, description = ?, status = ?
    WHERE id = ?");

$stmt->bind_param(
    "isidissssssi",
    $brand_id, $model, $year, $price, $color, $mileage,
    $fuel_type, $transmission, $image, $description, $status, $id
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Vehículo actualizado correctamente",
        "image_url" => $image_url
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar vehículo",
        "error" => $stmt->error
    ]);
}
