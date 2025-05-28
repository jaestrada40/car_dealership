document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const profileInfo = document.getElementById("profileInfo");
  const ordersList = document.getElementById("ordersList");

  if (!token) {
    profileInfo.innerHTML = `<p class="text-red-600">Debes iniciar sesión para ver tu perfil.</p>`;
    return;
  }

  // Cargar perfil de usuario
  fetch("http://localhost/car_dealership/backend/users/get_user.php", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.user) {
        const u = data.user;
        profileInfo.innerHTML = `
          <p><strong>Nombre:</strong> ${u.first_name} ${u.last_name}</p>
          <p><strong>Email:</strong> ${u.email}</p>
          <p><strong>Usuario:</strong> ${u.username}</p>
          <p><strong>Rol:</strong> ${u.role}</p>
        `;
      } else {
        profileInfo.innerHTML = `<p class="text-red-600">Error al cargar el perfil.</p>`;
      }
    })
    .catch((err) => {
      console.error("Error al cargar perfil:", err);
      profileInfo.innerHTML = `<p class="text-red-600">No se pudo cargar el perfil.</p>`;
    });

  // Cargar historial de pedidos
  fetch("http://localhost/car_dealership/backend/orders/get_my_orders.php", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && Array.isArray(data.orders)) {
        if (data.orders.length === 0) {
          ordersList.innerHTML = `<p class="text-gray-600">No tienes pedidos registrados.</p>`;
          return;
        }

        ordersList.innerHTML = data.orders
          .map(
            (order) => `
            <div class="border p-4 rounded mb-4">
              <p><strong>Pedido #${order.id}</strong></p>
              <p>Método de pago: ${order.payment_method}</p>
              <p>Dirección: ${order.address}</p>
              <p>Total: Q${parseFloat(order.total).toFixed(2)}</p>
              <p>Fecha: ${order.created_at}</p>
            </div>
          `
          )
          .join("");
      } else {
        ordersList.innerHTML = `<p class="text-red-600">Error al cargar pedidos.</p>`;
      }
    })
    .catch((err) => {
      console.error("Error al cargar pedidos:", err);
      ordersList.innerHTML = `<p class="text-red-600">No se pudo cargar el historial de pedidos.</p>`;
    });
});
