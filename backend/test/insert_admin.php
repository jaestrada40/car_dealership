<?php
// insert_admin.php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "car_dealership";

// Conexión
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Datos del administrador
$first_name = "Admin";
$last_name = "Principal";
$email = "admin@correo.com";
$username = "admin";
$password = password_hash("admin123", PASSWORD_DEFAULT);
$role = "admin";

// Verificar si ya existe
$check = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$check->bind_param("ss", $email, $username);
$check->execute();
$check->store_result();

if ($check->num_rows === 0) {
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $first_name, $last_name, $email, $username, $password, $role);
    
    if ($stmt->execute()) {
        echo "Usuario administrador creado con éxito.";
    } else {
        echo "Error al crear usuario: " . $stmt->error;
    }
} else {
    echo "El usuario administrador ya existe.";
}