<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth_middleware.php';

header('Content-Type: application/json');

// Intentar verificar token (opcional)
$userData = null;
try {
    $userData = checkAuth(false); // false = no obligatorio
} catch (Exception $e) {
    $userData = null; // Permitir anónimo
}

// Leer datos
$data = json_decode(file_get_contents("php://input"), true);

$required = ['car_id', 'full_name', 'phone', 'date', 'time'];
foreach ($required as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        echo json_encode(["success" => false, "message" => "Campo obligatorio faltante: $field"]);
        exit;
    }
}

$car_id    = intval($data['car_id']);
$full_name = htmlspecialchars(trim($data['full_name']));
$phone     = htmlspecialchars(trim($data['phone']));
$email     = isset($data['email']) ? filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) : null;
$date      = $data['date'];
$time      = $data['time'];
$comment   = isset($data['comment']) ? htmlspecialchars(trim($data['comment'])) : null;
$user_id   = $userData ? intval($userData['sub']) : null;

// Validación simple de fecha y hora
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)) {
    echo json_encode(["success" => false, "message" => "Formato de fecha u hora inválido"]);
    exit;
}

// Conexión
$conn = getDBConnection();

// Verificar que el carro exista
$checkCar = $conn->prepare("SELECT id FROM cars WHERE id = ?");
$checkCar->bind_param("i", $car_id);
$checkCar->execute();
$carResult = $checkCar->get_result();

if ($carResult->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El vehículo no existe"]);
    exit;
}

// Insertar cita
$stmt = $conn->prepare("INSERT INTO appointments (car_id, user_id, full_name, phone, email, date, time, comment)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("iissssss", $car_id, $user_id, $full_name, $phone, $email, $date, $time, $comment);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cita agendada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al agendar la cita", "error" => $stmt->error]);
}
