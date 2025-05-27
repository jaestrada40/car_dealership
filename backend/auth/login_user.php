<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../jwt/JWTExceptionWithPayloadInterface.php';
require_once __DIR__ . '/../jwt/BeforeValidException.php';
require_once __DIR__ . '/../jwt/ExpiredException.php';
require_once __DIR__ . '/../jwt/SignatureInvalidException.php';
require_once __DIR__ . '/../jwt/JWT.php';
require_once __DIR__ . '/../jwt_config.php';
require_once __DIR__ . '/../db.php';

use Firebase\JWT\JWT;

// Obtener datos
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['identifier']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Faltan credenciales"]);
    exit;
}

$identifier = trim($data['identifier']);
$password = $data['password'];

// Obtener conexión
$conn = getDBConnection();

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
$stmt->bind_param("ss", $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        $payload = [
            "sub" => $user['id'],
            "email" => $user['email'],
            "role" => $user['role'],
            "exp" => time() + (60 * 60 * 24) // 24 horas
        ];

        $jwt = JWT::encode($payload, $key, $algorithm);

        unset($user['password']);

        echo json_encode([
            "success" => true,
            "token" => $jwt,
            "user" => $user
        ]);
        exit;
    }
}

echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
