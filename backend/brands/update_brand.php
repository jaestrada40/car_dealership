<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

// Leer el cuerpo de la solicitud (JSON)
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id']) || empty(trim($data['name']))) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$id = intval($data['id']);
$name = htmlspecialchars(trim($data['name']));

// Conexión
$conn = getDBConnection();

// Verificar marca existente
$check = $conn->prepare("SELECT image FROM brands WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Marca no encontrada"]);
    exit;
}

$row = $result->fetch_assoc();
$image = $row['image'];

// ¿Subir nueva imagen?
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $newName = uniqid('brand_') . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/brands/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $newName)) {
        // Eliminar la anterior si existe
        if ($image && file_exists($uploadDir . $image)) {
            unlink($uploadDir . $image);
        }

        $image = $newName;
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir imagen"]);
        exit;
    }
} elseif (isset($data['image'])) {
    $image = $data['image'];
}

// Actualizar marca
$stmt = $conn->prepare("UPDATE brands SET name = ?, image = ? WHERE id = ?");
$stmt->bind_param("ssi", $name, $image, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Marca actualizada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar", "error" => $stmt->error]);
}