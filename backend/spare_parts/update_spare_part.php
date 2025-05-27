<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar que sea admin
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Validar ID y campos
if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($_POST['id']);
$name = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name'])) : null;
$description = isset($_POST['description']) ? htmlspecialchars(trim($_POST['description'])) : null;
$price = isset($_POST['price']) ? floatval($_POST['price']) : null;
$stock = isset($_POST['stock']) ? intval($_POST['stock']) : null;
$category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : null;

$image = null;
$image_url = null;

$conn = getDBConnection();

// Verificar existencia del repuesto
$check = $conn->prepare("SELECT image FROM spare_parts WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Repuesto no encontrado"]);
    exit;
}

$current = $result->fetch_assoc();
$existingImage = $current['image'];

// Subida nueva imagen
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newName = uniqid('spare_') . '.' . $ext;

    $uploadDir = __DIR__ . '/../../uploads/spare_parts/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $newName)) {
        $image = $newName;

        // Eliminar imagen anterior si existe
        if ($existingImage && file_exists($uploadDir . $existingImage)) {
            unlink($uploadDir . $existingImage);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir nueva imagen"]);
        exit;
    }
} else {
    $image = $existingImage;
}

// Actualizar repuesto
$stmt = $conn->prepare("UPDATE spare_parts 
    SET name = ?, description = ?, price = ?, image = ?, category_id = ?, stock = ? 
    WHERE id = ?");
$stmt->bind_param("ssdssii", $name, $description, $price, $image, $category_id, $stock, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Repuesto actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar repuesto", "error" => $stmt->error]);
}
