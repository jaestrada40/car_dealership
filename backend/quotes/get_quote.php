<?php
// backend/quotes/get_quote.php

require_once '../db.php';
require_once '../auth_middleware.php';

header('Content-Type: application/json');
$conn   = getDBConnection();
$userData = checkAuth();
$userId = intval($userData['sub']);

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "ID no válido"
    ]);
    exit;
}

$sql = "
    SELECT 
      q.id,
      q.spare_part_id,
      sp.name  AS spare_part_name,
      sp.image AS spare_part_image_url,  -- suponiendo que tu tabla tenga columna 'image'
      q.full_name,
      q.phone,
      q.email,
      q.quantity,
      q.comment,
      q.status,
      q.created_at
    FROM `quotes` AS q
    JOIN `spare_parts` AS sp ON q.spare_part_id = sp.id
    WHERE q.id = ? AND q.user_id = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta SQL: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("ii", $id, $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Armar ruta relativa para Flutter:
    $row['spare_part_image_url'] = $row['spare_part_image_url']
        ? '' . $row['spare_part_image_url']
        : null;

    echo json_encode([
        "success" => true,
        "quote" => [
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
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Cotización no encontrada o no autorizada"
    ]);
}

$stmt->close();
$conn->close();