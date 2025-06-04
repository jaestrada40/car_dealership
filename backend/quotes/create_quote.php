<?php
// backend/quotes/create_quote.php

require_once '../db.php';
require_once '../jwt/JWTExceptionWithPayloadInterface.php';
require_once '../jwt/BeforeValidException.php';
require_once '../jwt/ExpiredException.php';
require_once '../jwt/SignatureInvalidException.php';
require_once '../jwt/JWT.php';
require_once '../jwt_config.php';

use Firebase\JWT\JWT;

header('Content-Type: application/json');
$conn = getDBConnection();

// --- 1) Intentar obtener user_id desde el Authorization Bearer, si existe ---
$userId = null;
$headers = [];
if (function_exists('getallheaders')) {
    $headers = getallheaders();
}
// Revisar también en $_SERVER
if (empty($headers['Authorization']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
}
if (empty($headers['Authorization']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

if (!empty($headers['Authorization'])) {
    $token = str_replace("Bearer ", "", $headers['Authorization']);
    try {
        $decoded = JWT::decode($token, $GLOBALS['key'], [$GLOBALS['algorithm']]);
        $payload = (array)$decoded;
        if (isset($payload['sub'])) {
            $userId = intval($payload['sub']);
        }
    } catch (Exception $e) {
        // Si el token es inválido o expirado, ignoramos y dejamos userId = null
        $userId = null;
    }
}

// --- 2) Leer JSON del body ---
$input = json_decode(file_get_contents('php://input'), true);

if (
    empty($input['spare_part_id']) ||
    empty($input['full_name'])    ||
    empty($input['phone'])        ||
    empty($input['email'])        ||
    empty($input['quantity'])
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos obligatorios"
    ]);
    exit;
}

$sparePartId = intval($input['spare_part_id']);
$fullName    = $conn->real_escape_string($input['full_name']);
$phone       = $conn->real_escape_string($input['phone']);
$email       = $conn->real_escape_string($input['email']);
$quantity    = intval($input['quantity']);
$comment     = isset($input['comment'])
                 ? $conn->real_escape_string($input['comment'])
                 : '';

// --- 3) INSERT con user_id (puede ser NULL) ---
$sql = "INSERT INTO `quotes`
    (`spare_part_id`, `user_id`, `full_name`, `phone`, `email`, `quantity`, `comment`, `status`)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')";
$stmt = $conn->prepare($sql);

// Si $userId es null, hay que pasarlo como NULL en bind_param. Para ello, usaremos
// la variable $paramUserId, que será _null_ o entero.
if ($userId === null) {
    // Para pasar NULL en bind_param, debemos usar directamente un valor PHP null
    $paramUserId = null;
    // Y en la cadena de tipos lo seguimos marcando como “i” (int), MySQL trabajará con NULL.
} else {
    $paramUserId = $userId;
}

$stmt->bind_param(
    "iisssis",
    $sparePartId,
    $paramUserId,
    $fullName,
    $phone,
    $email,
    $quantity,
    $comment
);

if ($stmt->execute()) {
    echo json_encode([
        "success"  => true,
        "quote_id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al crear la cotización"
    ]);
}

$stmt->close();
$conn->close();
