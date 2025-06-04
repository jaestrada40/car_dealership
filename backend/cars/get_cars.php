<?php
//require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$conn = getDBConnection();

// Filtros opcionales
$conditions = [];
$params = [];
$types = "";

// Construir condiciones dinámicas
if (isset($_GET['brand_id']) && is_numeric($_GET['brand_id'])) {
    $conditions[] = "cars.brand_id = ?";
    $params[] = intval($_GET['brand_id']);
    $types .= "i";
}
if (isset($_GET['model']) && $_GET['model'] !== '') {
    $conditions[] = "cars.model LIKE ?";
    $params[] = '%' . $_GET['model'] . '%';
    $types .= "s";
}
if (isset($_GET['year']) && is_numeric($_GET['year'])) {
    $conditions[] = "cars.year = ?";
    $params[] = intval($_GET['year']);
    $types .= "i";
}
if (isset($_GET['fuel_type']) && $_GET['fuel_type'] !== '') {
    $conditions[] = "cars.fuel_type = ?";
    $params[] = $_GET['fuel_type'];
    $types .= "s";
}
if (isset($_GET['transmission']) && $_GET['transmission'] !== '') {
    $conditions[] = "cars.transmission = ?";
    $params[] = $_GET['transmission'];
    $types .= "s";
}
if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
    $conditions[] = "cars.price <= ?";
    $params[] = floatval($_GET['max_price']);
    $types .= "d";
}
if (isset($_GET['status']) && $_GET['status'] !== '') {
    $conditions[] = "cars.status = ?";
    $params[] = $_GET['status'];
    $types .= "s";
}

// Construir SQL con filtros
$sql = "SELECT 
            cars.id,
            cars.brand_id,
            brands.name AS brand_name,
            cars.model,
            cars.year,
            cars.price,
            cars.color,
            cars.mileage,
            cars.fuel_type,
            cars.transmission,
            cars.image,
            cars.description,
            cars.status,
            cars.created_at
        FROM cars
        JOIN brands ON cars.brand_id = brands.id";

if (count($conditions) > 0) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " ORDER BY cars.created_at DESC";

$stmt = $conn->prepare($sql);

if (count($params) > 0) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$cars = [];
while ($row = $result->fetch_assoc()) {
    $row['image_url'] = $row['image'] ?: null;
    $cars[] = $row;
}

echo json_encode([
    "success" => true,
    "filters" => $_GET,
    "cars" => $cars
]);