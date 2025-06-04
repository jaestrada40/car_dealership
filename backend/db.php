<?php
function getDBConnection() {
    $conn = new mysqli("localhost", "root", "", "car_dealership");

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Conexión fallida: " . $conn->connect_error
        ]);
        exit;
    }

    return $conn;
}
