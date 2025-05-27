
# 📦 API del Sistema de Concesionario

## 🔐 Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login_user.php` | Login de usuario y devuelve token JWT |

## 👤 Usuarios
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/users/create_user.php` | Crear usuario | admin |
| POST | `/users/delete_user.php` | Eliminar usuario | admin |

## 🏷️ Marcas
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/brands/create_brand.php` | Crear marca (con imagen) | admin |
| GET | `/brands/get_brands.php` | Obtener marcas | público |
| POST | `/brands/update_brand.php` | Editar marca | admin |
| POST | `/brands/delete_brand.php` | Eliminar marca | admin |

## 🚗 Vehículos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/cars/create_car.php` | Crear vehículo | admin |
| GET | `/cars/get_cars.php` | Listar vehículos | público |
| GET | `/cars/get_car.php?id=X` | Detalle vehículo | público |
| POST | `/cars/update_car.php` | Editar vehículo | admin |
| POST | `/cars/delete_car.php` | Eliminar vehículo | admin |

## 🗂️ Categorías de Repuestos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/categories/create_category.php` | Crear categoría | admin |
| GET | `/categories/get_categories.php` | Obtener categorías | público |
| POST | `/categories/update_category.php` | Editar categoría | admin |
| POST | `/categories/delete_category.php` | Eliminar categoría | admin |

## 🧩 Repuestos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/spare_parts/create_spare_part.php` | Crear repuesto | admin |
| GET | `/spare_parts/get_spare_parts.php` | Listar repuestos | público |
| GET | `/spare_parts/get_spare_part.php?id=X` | Detalle repuesto | público |
| POST | `/spare_parts/update_spare_part.php` | Editar repuesto | admin |
| POST | `/spare_parts/delete_spare_part.php` | Eliminar repuesto | admin |

## 📅 Citas
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/appointments/create_appointment.php` | Crear cita | opcional |
| GET | `/appointments/get_appointments.php` | Ver todas las citas | admin |
| GET | `/appointments/get_my_appointments.php` | Ver mis citas | client |
| POST | `/appointments/update_appointment_status.php` | Cambiar estado cita | admin |
| POST | `/appointments/delete_appointment.php` | Eliminar cita | admin |

## 🛒 Pedidos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/orders/create_order.php` | Crear pedido | client |
| GET | `/orders/get_my_orders.php` | Ver mis pedidos | client |
| GET | `/orders/get_all_orders.php` | Ver todos los pedidos | admin |
| POST | `/orders/update_order_status.php` | Cambiar estado pedido | admin |
