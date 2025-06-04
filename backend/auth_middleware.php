<?php
// backend/auth_middleware.php
// NO cerrar el archivo con  al final para evitar enviar caracteres extra.

require_once __DIR__ . '/jwt/JWTExceptionWithPayloadInterface.php';
require_once __DIR__ . '/jwt/BeforeValidException.php';
require_once __DIR__ . '/jwt/ExpiredException.php';
require_once __DIR__ . '/jwt/SignatureInvalidException.php';
require_once __DIR__ . '/jwt/JWT.php';
require_once __DIR__ . '/jwt_config.php';

use Firebase\JWT\JWT;

/**
 * Verifica que exista un header “Authorization: Bearer <token>”.
 * Si no, responde 401 { "message":"Token no proporcionado" } y sale.
 * Si existe, intenta decodificar el token. Si es inválido, responde 401.
 * Si todo OK, devuelve el payload (array) con datos como “sub” y “role”.
 */
function checkAuth() {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }

    // A veces el servidor no incluye “Authorization” en getallheaders.
    // Verificamos $_SERVER['HTTP_AUTHORIZATION'] y $_SERVER['REDIRECT_HTTP_AUTHORIZATION'].
    if (empty($headers['Authorization']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (empty($headers['Authorization']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
	
	  // --- LÍNEAS PARA DEPURAR desde PHP: qué header llegó realmente
    error_log("---- getallheaders(): " . print_r(getallheaders(), true));
    error_log("---- _SERVER['HTTP_AUTHORIZATION']: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? '[no existe]'));
    error_log("---- _SERVER['REDIRECT_HTTP_AUTHORIZATION']: " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '[no existe]'));

    if (empty($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["message" => "Token no proporcionado"]);
        exit;
    }

    // Quitar prefijo “Bearer ”
    $token = str_replace("Bearer ", "", $headers['Authorization']);

    try {
        $decoded = JWT::decode($token, $GLOBALS['key'], [$GLOBALS['algorithm']]);
        return (array)$decoded; // El payload, p.ej. ['sub'=>6,'role'=>'client',…]
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => "Token inválido"]);
        exit;
    }
}