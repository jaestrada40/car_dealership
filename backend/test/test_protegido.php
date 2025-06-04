<?php
require_once '../auth_middleware.php';

header('Content-Type: application/json');

// Verificar token JWT
$userData = checkAuth();

// Si pasa la verificación, responder con éxito
echo json_encode([
    "success" => true,
    "message" => "Acceso autorizado",
    "user" => $userData
]);
