<?php
//require_once '../auth_middleware.php';
require_once '../db.php';

header('Content-Type: application/json');
$conn = getDBConnection();

$result = $conn->query("SELECT id, name, image FROM brands ORDER BY name ASC");

$brands = [];
while ($row = $result->fetch_assoc()) {
    // Usar la ruta de la imagen tal como está en la base de datos, sin añadir prefijo adicional
    $row['image'] = $row['image'] ? $row['image'] : null; // Mantener la ruta original
    $brands[] = $row;
}

echo json_encode([
    "success" => true,
    "brands" => $brands
]);
