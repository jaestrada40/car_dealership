<?php
require_once __DIR__ . '/jwt/JWTExceptionWithPayloadInterface.php';
require_once __DIR__ . '/jwt/BeforeValidException.php';
require_once __DIR__ . '/jwt/ExpiredException.php';
require_once __DIR__ . '/jwt/SignatureInvalidException.php';
require_once __DIR__ . '/jwt/JWT.php';
require_once __DIR__ . '/jwt_config.php';

use Firebase\JWT\JWT;

function checkAuth() {
    $headers = getallheaders();

    // Compatibilidad con servidores que no pasan bien Authorization
    if (!isset($headers['Authorization']) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["message" => "Token no proporcionado"]);
        exit;
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);

    try {
        $decoded = JWT::decode($token, $GLOBALS['key'], [$GLOBALS['algorithm']]);
        return (array)$decoded;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => "Token inválido"]);
        exit;
    }
}
