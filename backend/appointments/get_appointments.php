<?php
// backend/appointments/get_appointments.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Verificar token obligatorio
$userData = checkAuth(); 
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
      "success" => false,
      "message" => "Solo administradores pueden ver las citas"
    ]);
    exit;
}

$conn = getDBConnection();

// 2) Obtener citas con JOIN a cars y marcas
$sql = "
    SELECT 
      a.id,
      a.car_id,
      b.name AS brand_name,
      c.model,
      c.year,
      c.image AS raw_image,
      a.full_name,
      a.phone,
      a.email,
      a.date,
      a.time,
      a.comment,
      a.status,
      a.created_at
    FROM appointments AS a
    JOIN cars   AS c ON a.car_id = c.id
    JOIN brands AS b ON c.brand_id = b.id
    ORDER BY a.created_at DESC
";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode([
      "success" => false,
      "message" => "Error en la consulta: " . $conn->error
    ]);
    exit;
}

$appointments = [];

while ($row = $result->fetch_assoc()) {
    // Si c.image es el nombre del archivo (por ejemplo "car_123.jpg"), construimos la URL completa:
    $row['image_url'] = $row['raw_image']
        ? '/car_dealership/uploads/cars/' . basename($row['raw_image'])
        : null;
    unset($row['raw_image']);

    $appointments[] = $row;
}

echo json_encode([
    "success" => true,
    "appointments" => $appointments
]);

$conn->close();