<?php
// backend/quotes/get_all_quotes_admin.php

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Verificar token y rol “admin”
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden ver todas las cotizaciones"]);
    exit;
}

$conn = getDBConnection();

// 2) Traer todas las cotizaciones (JOIN para tener nombre e imagen del repuesto)
$sql = "
    SELECT 
      q.id,
      q.user_id,
      q.spare_part_id,
      sp.name AS spare_part_name,
      sp.image AS spare_part_image_url,
      q.full_name,
      q.phone,
      q.email,
      q.quantity,
      q.comment,
      q.status,
      q.created_at
    FROM `quotes` AS q
    JOIN `spare_parts` AS sp ON q.spare_part_id = sp.id
    ORDER BY q.created_at DESC
";

$result = $conn->query($sql);

$quotes = [];
while ($row = $result->fetch_assoc()) {
    // Construir la ruta completa para el frontend (Flutter)
    $row['spare_part_image_url'] = $row['spare_part_image_url']
        ? '/car_dealership/uploads/parts/' . $row['spare_part_image_url']
        : null;

    $quotes[] = [
        "id"                   => (int)$row['id'],
        "user_id"              => (int)$row['user_id'],
        "spare_part_id"        => (int)$row['spare_part_id'],
        "spare_part_name"      => $row['spare_part_name'],
        "spare_part_image_url" => $row['spare_part_image_url'],
        "full_name"            => $row['full_name'],
        "phone"                => $row['phone'],
        "email"                => $row['email'],
        "quantity"             => (int)$row['quantity'],
        "comment"              => $row['comment'],
        "status"               => $row['status'],
        "created_at"           => $row['created_at']
    ];
}

echo json_encode([
    "success" => true,
    "quotes"  => $quotes
]);

$conn->close();
// ¡Nada de saltos ni espacios después!
