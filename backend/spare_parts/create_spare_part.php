<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Solo admin puede crear repuestos
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Validar campos obligatorios
$required = ['name', 'price'];
foreach ($required as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        echo json_encode(["success" => false, "message" => "Campo obligatorio faltante: $field"]);
        exit;
    }
}

$name = htmlspecialchars(trim($_POST['name']));
$description = isset($_POST['description']) ? htmlspecialchars(trim($_POST['description'])) : null;
$price = floatval($_POST['price']);
$stock = isset($_POST['stock']) ? intval($_POST['stock']) : 0;
$category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : null;

$image = null;
$image_url = null;

// Subir imagen si existe
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newName = uniqid('spare_') . '.' . $ext;

    $uploadDir = __DIR__ . '/../../uploads/spare_parts/';
    $publicUrl = 'http://localhost/car_dealership/uploads/spare_parts/' . $newName;

    // Crear directorio si no existe
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Mover imagen
    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $newName)) {
        $image = $newName;
        $image_url = $publicUrl;
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir imagen"]);
        exit;
    }
}

$conn = getDBConnection();

// Insertar repuesto
$stmt = $conn->prepare("INSERT INTO spare_parts (name, description, price, image, category_id, stock)
                        VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssdssi", $name, $description, $price, $image, $category_id, $stock);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Repuesto creado correctamente",
        "image_url" => $image_url
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear repuesto",
        "error" => $stmt->error
    ]);
}
