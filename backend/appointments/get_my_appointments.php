<?php
// backend/appointments/get_my_appointments.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Verificar token y rol “client”
$userData = checkAuth();
if ($userData['role'] !== 'client') {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Solo clientes pueden acceder a sus citas"
    ]);
    exit;
}

$conn = getDBConnection();
$user_id = intval($userData['sub']);

$sql = "
    SELECT 
      a.id,
      a.car_id,
      b.name AS brand_name,
      c.model,
      c.year,
      c.image AS raw_image,          -- renombramos a “raw_image”
      a.full_name,
      a.phone,
      a.email,
      a.date,
      a.time,
      a.comment,
      a.status,
      a.created_at
    FROM `appointments` AS a
    JOIN `cars`   AS c ON a.car_id = c.id
    JOIN `brands` AS b ON c.brand_id = b.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta SQL: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];

while ($row = $result->fetch_assoc()) {
    // 1) Tomamos únicamente el nombre de archivo (basename).
    //    Ejemplo: si raw_image = "/car_dealership/uploads/cars/car_123.jpg",
    //    basename($row['raw_image']) = "car_123.jpg".
    $filename = basename($row['raw_image']);

    // 2) Construir una sola vez la URL relativa:
    $row['image_url'] = $filename
        ? '/car_dealership/uploads/cars/' . $filename
        : null;

    unset($row['raw_image']);

    $appointments[] = $row;
}

echo json_encode([
  "success"      => true,
  "appointments" => $appointments
]);

$stmt->close();
$conn->close();
// ¡No dejar espacios ni saltos de línea extra!
