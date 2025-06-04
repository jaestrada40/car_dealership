<?php
// backend/appointments/create_appointment.php

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt/JWTExceptionWithPayloadInterface.php';
require_once __DIR__ . '/../jwt/BeforeValidException.php';
require_once __DIR__ . '/../jwt/ExpiredException.php';
require_once __DIR__ . '/../jwt/SignatureInvalidException.php';
require_once __DIR__ . '/../jwt/JWT.php';
require_once __DIR__ . '/../jwt_config.php';

use Firebase\JWT\JWT;

header('Content-Type: application/json');

// -------------------------------------------------
// 1) Intentamos extraer user_id del JWT si existe.
//    Si no hay header Bearer o el token es inválido,
//    dejamos $userId = null (para insertar NULL en la tabla).
// -------------------------------------------------
$userId = null;
$headers = [];

// Obtener todos los headers (incluye Authorization si llega)
if (function_exists('getallheaders')) {
    $headers = getallheaders();
}
// A veces Apache o nginx lo ponen en $_SERVER
if (empty($headers['Authorization']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
}
if (empty($headers['Authorization']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

if (!empty($headers['Authorization'])) {
    // Sacar el prefijo "Bearer "
    $token = str_replace("Bearer ", "", $headers['Authorization']);
    try {
        $decoded = JWT::decode($token, $GLOBALS['key'], [$GLOBALS['algorithm']]);
        $payloadArray = (array) $decoded;
        if (isset($payloadArray['sub'])) {
            $userId = intval($payloadArray['sub']);
        }
    } catch (Exception $e) {
        // Token inválido o expirado: dejamos $userId = null
        $userId = null;
    }
}

// -------------------------------------------------
// 2) Leer JSON del body
// -------------------------------------------------
$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['car_id']) ||
    empty($data['full_name']) ||
    empty($data['phone']) ||
    empty($data['email']) ||
    empty($data['date']) ||
    empty($data['time'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos obligatorios deben completarse."
    ]);
    exit;
}

$conn = getDBConnection();

// -------------------------------------------------
// 3) Preparar e INSERT en appointments
//    Si $userId es null, insertamos NULL.
//    Si $userId no es null, insertamos ese valor.
// -------------------------------------------------
if ($userId !== null) {
    // Caso A: hay userId, usamos placeholder para user_id
    $sql = "
        INSERT INTO appointments
          (car_id, user_id, full_name, phone, email, date, time, comment, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Error en la consulta SQL: " . $conn->error
        ]);
        exit;
    }
    $uid = $userId;
    $comment = isset($data['comment']) ? $data['comment'] : "";
    // Tipos: i  i  s           s       s      s      s      s
    $stmt->bind_param(
        "iissssss",
        $data['car_id'],
        $uid,
        $data['full_name'],
        $data['phone'],
        $data['email'],
        $data['date'],
        $data['time'],
        $comment
    );
} else {
    // Caso B: no hay userId, insertamos NULL directamente en la consulta
    $sql = "
        INSERT INTO appointments
          (car_id, user_id, full_name, phone, email, date, time, comment, status)
        VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 'pendiente')
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Error en la consulta SQL: " . $conn->error
        ]);
        exit;
    }
    $comment = isset($data['comment']) ? $data['comment'] : "";
    // Tipos: i  s           s       s      s      s      s
    $stmt->bind_param(
        "issssss",
        $data['car_id'],
        $data['full_name'],
        $data['phone'],
        $data['email'],
        $data['date'],
        $data['time'],
        $comment
    );
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Cita creada con éxito."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear la cita: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
