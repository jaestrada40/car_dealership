<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 1) Validar parámetro
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

$id = intval($_GET['id']);
$conn = getDBConnection();

// 2) Consulta
$sql = "SELECT 
            sp.id,
            sp.name,
            sp.description,
            sp.price,
            sp.stock,
            sp.image,       -- aquí 'image' ya contiene la ruta completa relativa
            sp.created_at,
            c.name AS category
        FROM spare_parts sp
        LEFT JOIN categories c ON sp.category_id = c.id
        WHERE sp.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Repuesto no encontrado"]);
    exit;
}

$row = $result->fetch_assoc();

// 3) En lugar de concatenar otra vez, devolvemos exactamente lo que hay en DB.
//    (por ejemplo: "/car_dealership/uploads/spare_parts/683a6d3af2889.jpg")
$row['image_url'] = $row['image'] !== null
    ? $row['image']
    : null;

// 4) Quitamos la columna 'image' para no duplicar datos
unset($row['image']);

echo json_encode([
    "success"    => true,
    "spare_part" => $row
]);

$stmt->close();
$conn->close();
?>
