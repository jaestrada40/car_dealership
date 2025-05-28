<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Validar campos requeridos
if (
    empty($data['car_id']) ||
    empty($data['full_name']) ||
    empty($data['phone']) ||
    empty($data['email']) ||
    empty($data['date']) ||
    empty($data['time'])
) {
    echo json_encode(["success" => false, "message" => "Todos los campos obligatorios deben completarse."]);
    exit;
}

$conn = getDBConnection();

$stmt = $conn->prepare("
    INSERT INTO appointments (car_id, full_name, phone, email, date, time, comment, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
");

$stmt->bind_param(
    "issssss",
    $data['car_id'],
    $data['full_name'],
    $data['phone'],
    $data['email'],
    $data['date'],
    $data['time'],
    $data['comment']
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cita creada con éxito."]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear la cita."]);
}
