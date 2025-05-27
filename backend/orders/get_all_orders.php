<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar admin
$userData = checkAuth();
if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Solo administradores pueden ver los pedidos"]);
    exit;
}

$conn = getDBConnection();

// Obtener todos los pedidos con info del cliente
$sql = "SELECT o.*, u.first_name, u.last_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC";

$res = $conn->query($sql);
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
