<?php
require_once '../db.php';           // Ajusta la ruta si tu proyecto la tiene en otro lugar
//require_once '../auth_middleware.php';

header('Content-Type: application/json');
$conn = getDBConnection();

// 1) Leer el parámetro id (brand_id)
$brandId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($brandId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "ID de marca no válido"
    ]);
    exit;
}

// 2) Consulta: devolvemos cada columna con el alias que Dart espera
$sql = "
  SELECT 
    cars.id,
    cars.brand_id,
    brands.name       AS brand_name,    -- coincide con Car.fromJson(json['brand_name'])
    cars.model,
    cars.year,
    cars.transmission,
    cars.price,
    cars.fuel_type,
    cars.mileage,
    cars.description,
    cars.status,
    cars.image        AS image_filename
  FROM cars
  JOIN brands ON cars.brand_id = brands.id
  WHERE cars.brand_id = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $brandId);
$stmt->execute();
$result = $stmt->get_result();

// 3) Armamos el array con las claves exactas que Dart espera:
$cars = [];
while ($row = $result->fetch_assoc()) {
    // Aquí NO concatenamos dos veces “/car_dealership/uploads/cars/…”
    // Supongamos que en DB `cars.image` ya está guardado como "car_dealership/uploads/cars/mi_foto.jpg".
    // Entonces basta con:
    if (!empty($row['image_filename'])) {
        $fullImageUrl = "http://localhost/" . $row['image_filename'];
    } else {
        $fullImageUrl = null;
    }

    $cars[] = [
        "id"          => (int) $row['id'],
        "brand_id"    => (int) $row['brand_id'],
        "brand_name"  => $row['brand_name'],
        "model"       => $row['model'],
        "year"        => (int) $row['year'],
        "transmission"=> $row['transmission'],
        "price"       => $row['price'],
        "fuel_type"   => $row['fuel_type'],
        "mileage"     => (int) $row['mileage'],
        "description" => $row['description'],
        "status"      => $row['status'],
        "image_url"   => $fullImageUrl
    ];
}

echo json_encode([
    "success" => true,
    "cars"    => $cars
]);

$stmt->close();
$conn->close();
