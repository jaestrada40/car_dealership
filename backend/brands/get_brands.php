<?php
require_once '../auth_middleware.php';
require_once '../db.php'; //

header('Content-Type: application/json');
$conn = getDBConnection();

$result = $conn->query("SELECT id, name, image FROM brands ORDER BY name ASC");

$brands = [];
while ($row = $result->fetch_assoc()) {
    // Adjuntar la ruta completa si usas archivos locales
    $row['image'] = $row['image'] ? "http://localhost/car_dealership/uploads/brands/" . $row['image'] : null;
    $brands[] = $row;
}

echo json_encode([
    "success" => true,
    "brands" => $brands
]);
