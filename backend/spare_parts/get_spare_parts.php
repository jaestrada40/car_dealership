<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$conn = getDBConnection();

// Consulta con categoría incluida
$sql = "SELECT 
            sp.id,
            sp.name,
            sp.description,
            sp.price,
            sp.stock,
            sp.image,
            sp.created_at,
            c.name AS category
        FROM spare_parts sp
        LEFT JOIN categories c ON sp.category_id = c.id
        ORDER BY sp.created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
    $conn->close();
    exit;
}

$spare_parts = [];
$baseUrl = "http://" . $_SERVER['HTTP_HOST'];

while ($row = $result->fetch_assoc()) {
    // Construir la URL completa usando la ruta relativa almacenada en image
    $row['image_url'] = $row['image'] ? $baseUrl . $row['image'] : null;

    unset($row['image']);
    $spare_parts[] = $row;
}

echo json_encode([
    "success" => true,
    "spare_parts" => $spare_parts
]);

$conn->close();
?>