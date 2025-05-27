<?php
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// Verificar usuario logueado
$userData = checkAuth();
$user_id = intval($userData['sub']);

$data = json_decode(file_get_contents("php://input"), true);

// Validar campos obligatorios
if (
    !isset($data['payment_method']) ||
    !isset($data['address']) ||
    !isset($data['items']) ||
    !is_array($data['items']) ||
    count($data['items']) === 0
) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$payment_method = strtolower(trim($data['payment_method']));
$address = trim($data['address']);
$items = $data['items'];

$validMethods = ['efectivo', 'tarjeta'];
if (!in_array($payment_method, $validMethods)) {
    echo json_encode(["success" => false, "message" => "Método de pago inválido"]);
    exit;
}

// Calcular total
$total = 0;
foreach ($items as $item) {
    if (!isset($item['spare_part_id'], $item['quantity'], $item['price_unit'])) {
        echo json_encode(["success" => false, "message" => "Datos de ítems inválidos"]);
        exit;
    }
    $total += $item['quantity'] * $item['price_unit'];
}

$conn = getDBConnection();
$conn->begin_transaction();

try {
    // Insertar pedido
    $stmt = $conn->prepare("INSERT INTO orders (user_id, payment_method, address, total) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("issd", $user_id, $payment_method, $address, $total);
    $stmt->execute();
    $order_id = $stmt->insert_id;

    // Insertar cada ítem
    $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, spare_part_id, quantity, price_unit) VALUES (?, ?, ?, ?)");

    foreach ($items as $item) {
        $spare_part_id = intval($item['spare_part_id']);
        $quantity = intval($item['quantity']);
        $price_unit = floatval($item['price_unit']);

        $itemStmt->bind_param("iiid", $order_id, $spare_part_id, $quantity, $price_unit);
        $itemStmt->execute();
    }

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Pedido registrado correctamente", "order_id" => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al registrar el pedido", "error" => $e->getMessage()]);
}
