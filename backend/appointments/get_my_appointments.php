<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token obligatorio
$userData = checkAuth();

if ($userData['role'] !== 'client') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo clientes pueden acceder a sus citas"]);
    exit;
}

$conn = getDBConnection();
$user_id = intval($userData['sub']);

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
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];

while ($row = $result->fetch_assoc()) {
    $row['image_url'] = $row['image']
        ? 'http://localhost/car_dealership/uploads/cars/' . $row['image']
        : null;
    unset($row['image']);

    $appointments[] = $row;
}

echo json_encode([
    "success" => true,
    "appointments" => $appointments
]);
