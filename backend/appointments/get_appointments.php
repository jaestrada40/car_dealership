<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token obligatorio
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden ver las citas"]);
    exit;
}

$conn = getDBConnection();

// Obtener citas con JOIN a cars y marcas
$sql = "SELECT 
            a.id,
            a.car_id,
            b.name AS brand_name,
            c.model,
            c.year,
            c.image,
            a.full_name,
            a.phone,
            a.email,
            a.date,
            a.time,
            a.comment,
            a.status,
            a.created_at
        FROM appointments a
        JOIN cars c ON a.car_id = c.id
        JOIN brands b ON c.brand_id = b.id
        ORDER BY a.created_at DESC";

$result = $conn->query($sql);

$appointments = [];

while ($row = $result->fetch_assoc()) {
    $row['image_url'] = $row['image']
        ? 'http://localhost/car_dealership/uploads/cars/' . $row['image']
        : null;
    unset($row['image']); // No necesitamos enviar el nombre del archivo

    $appointments[] = $row;
}

echo json_encode([
    "success" => true,
    "appointments" => $appointments
]);
