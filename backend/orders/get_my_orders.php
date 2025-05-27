<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar autenticación
$userData = checkAuth();
$user_id = intval($userData['sub']);

$conn = getDBConnection();

// Obtener pedidos del usuario
$sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$orders = [];

while ($order = $res->fetch_assoc()) {
    $order_id = $order['id'];

    // Obtener ítems del pedido
    $itemStmt = $conn->prepare(
        "SELECT oi.*, sp.name AS spare_name, sp.image
         FROM order_items oi
         JOIN spare_parts sp ON oi.spare_part_id = sp.id
         WHERE oi.order_id = ?"
    );
    $itemStmt->bind_param("i", $order_id);
    $itemStmt->execute();
    $itemRes = $itemStmt->get_result();

    $items = [];
    while ($item = $itemRes->fetch_assoc()) {
        $item['image_url'] = $item['image']
            ? 'http://localhost/car_dealership/uploads/spare_parts/' . $item['image']
            : null;
        unset($item['image']);
        $items[] = $item;
    }

    $order['items'] = $items;
    $orders[] = $order;
}

echo json_encode([
    "success" => true,
    "orders" => $orders
]);
