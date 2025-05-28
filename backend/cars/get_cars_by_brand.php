<?php
require_once '../auth_middleware.php';
require_once '../db.php';

header('Content-Type: application/json');

$conn = getDBConnection();

$brandId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($brandId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "ID de marca no válido"
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT cars.id, cars.model, cars.year, cars.transmission, cars.price, cars.image, brands.name AS brand 
                        FROM cars 
                        JOIN brands ON cars.brand_id = brands.id 
                        WHERE brand_id = ?");
$stmt->bind_param("i", $brandId);
$stmt->execute();
$result = $stmt->get_result();

$cars = [];
while ($row = $result->fetch_assoc()) {
    // Ruta completa si la imagen existe
    $row['image'] = $row['image'] ? "http://localhost/car_dealership/uploads/cars/" . $row['image'] : null;
    $cars[] = $row;
}

echo json_encode([
    "success" => true,
    "cars" => $cars
]);
