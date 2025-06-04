<?php
// backend/quotes/get_all_quotes.php

require_once '../db.php';
require_once '../auth_middleware.php';
header('Content-Type: application/json');

// 1) Verificar token y extraer “sub” = user_id
$userData = checkAuth();
$userId   = intval($userData['sub']);

$conn = getDBConnection();

// 2) Solo traer las cotizaciones cuyo q.user_id = $userId
$sql = "
    SELECT 
      q.id,
      q.spare_part_id,
      sp.name AS spare_part_name,
      sp.image AS spare_part_image_url,  -- suponemos 'image' en tabla spare_parts
      q.full_name,
      q.phone,
      q.email,
      q.quantity,
      q.comment,
      q.status,
      q.created_at
    FROM `quotes` AS q
    JOIN `spare_parts` AS sp ON q.spare_part_id = sp.id
    WHERE q.user_id = ?
    ORDER BY q.created_at DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta SQL: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$quotes = [];

while ($row = $result->fetch_assoc()) {
    // Construir ruta completa para NetworkImage en Flutter:
    $row['spare_part_image_url'] = $row['spare_part_image_url']
        ? '' . $row['spare_part_image_url']
        : null;

    $quotes[] = [
        "id"                   => (int)$row['id'],
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

$stmt->close();
$conn->close();

// ¡Nada de saltos de línea ni espacios extra al final!
