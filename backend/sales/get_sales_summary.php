<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar token
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

$conn = getDBConnection();

// Verificar si la conexión es válida
if ($conn === false) {
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
    exit;
}

// Obtener parámetro de período
$period = isset($_GET['period']) ? $_GET['period'] : null;

// Preparar respuesta
$response = ["success" => true];

try {
    if ($period === 'monthly') {
        $result = $conn->query("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                SUM(total) AS total
            FROM orders
            WHERE status != 'cancelado'
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month
        ");
        if ($result === false) {
            throw new Exception("Error en la consulta mensual: " . $conn->error);
        }
        $monthlySales = $result->fetch_all(MYSQLI_ASSOC);
        $response['monthly_sales'] = $monthlySales;
    } elseif ($period === 'weekly') {
        $result = $conn->query("
            SELECT 
                CONCAT(YEAR(created_at), '-W', WEEK(created_at)) AS week,
                SUM(total) AS total
            FROM orders
            WHERE status != 'cancelado'
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
            GROUP BY YEAR(created_at), WEEK(created_at)
            ORDER BY week
        ");
        if ($result === false) {
            throw new Exception("Error en la consulta semanal: " . $conn->error);
        }
        $weeklySales = $result->fetch_all(MYSQLI_ASSOC);
        $response['weekly_sales'] = $weeklySales;
    } else {
        // Si no se especifica período, devolver ambos
        $monthlyResult = $conn->query("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                SUM(total) AS total
            FROM orders
            WHERE status != 'cancelado'
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month
        ");
        if ($monthlyResult === false) {
            throw new Exception("Error en la consulta mensual: " . $conn->error);
        }
        $weeklyResult = $conn->query("
            SELECT 
                CONCAT(YEAR(created_at), '-W', WEEK(created_at)) AS week,
                SUM(total) AS total
            FROM orders
            WHERE status != 'cancelado'
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
            GROUP BY YEAR(created_at), WEEK(created_at)
            ORDER BY week
        ");
        if ($weeklyResult === false) {
            throw new Exception("Error en la consulta semanal: " . $conn->error);
        }
        $response['monthly_sales'] = $monthlyResult->fetch_all(MYSQLI_ASSOC);
        $response['weekly_sales'] = $weeklyResult->fetch_all(MYSQLI_ASSOC);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}

echo json_encode($response);