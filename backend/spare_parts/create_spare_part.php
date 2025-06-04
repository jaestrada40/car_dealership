<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token y rol
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden crear repuestos"]);
    exit;
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

$name = isset($data['name']) ? htmlspecialchars(trim($data['name'])) : null;
$description = isset($data['description']) ? htmlspecialchars(trim($data['description'])) : null;
$price = isset($data['price']) && is_numeric($data['price']) ? floatval($data['price']) : null;
$stock = isset($data['stock']) && is_numeric($data['stock']) ? intval($data['stock']) : null;
$category_id = isset($data['category_id']) && is_numeric($data['category_id']) ? intval($data['category_id']) : null;
$image = isset($data['image']) ? htmlspecialchars(trim($data['image'])) : null;

if (!$name || !$price || !$stock) {
    echo json_encode(["success" => false, "message" => "Campos obligatorios faltantes"]);
    exit;
}

$conn = getDBConnection();

// Verificar que la categoría exista (si se proporcionó)
if ($category_id) {
    $checkCategory = $conn->prepare("SELECT id FROM categories WHERE id = ?");
    $checkCategory->bind_param("i", $category_id);
    $checkCategory->execute();
    $checkCategory->store_result();
    if ($checkCategory->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Categoría no encontrada"]);
        exit;
    }
}

// Insertar repuesto
$stmt = $conn->prepare("INSERT INTO spare_parts (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssdiss", $name, $description, $price, $stock, $category_id, $image);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Repuesto creado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear repuesto", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>