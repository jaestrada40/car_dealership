const loadOrders = async () => {
  const data = await apiFetch("/orders/get_orders.php");
  if (data.success) {
    const ordersTableBody = document.getElementById("ordersTableBody");
    ordersTableBody.innerHTML = data.orders
      .map(
        (order) => `
            <tr>
              <td>${order.id}</td>
              <td>${order.user_name}</td>
              <td>Q${parseFloat(order.total).toFixed(2)}</td>
              <td>${new Date(order.created_at).toLocaleDateString()}</td>
              <td>${order.status}</td>
              <td>
                <button class="viewOrderBtn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" data-id="${
                  order.id
                }">Ver Detalles</button>
              </td>
            </tr>
          `
      )
      .join("");
    attachOrderEventListeners();
  }
};

const attachOrderEventListeners = () => {
  document.querySelectorAll(".viewOrderBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.id;
      const data = await apiFetch(`/orders/get_order.php?id=${orderId}`);
      if (data.success) {
        const order = data.order;
        document.getElementById("orderId").textContent = order.id;
        document.getElementById("orderUser").textContent = order.user_name;
        document.getElementById("orderTotal").textContent = `Q${parseFloat(
          order.total
        ).toFixed(2)}`;
        document.getElementById("orderDate").textContent = new Date(
          order.created_at
        ).toLocaleString();
        document.getElementById("orderStatus").textContent = order.status;
        document.getElementById("orderStatusSelect").value = order.status;
        document.getElementById("updateOrderStatusBtn").dataset.id = order.id;
        document.getElementById("orderModal").style.display = "flex";
      }
    });
  });
};

const setupOrderForm = () => {
  document
    .getElementById("closeOrderModalBtn")
    .addEventListener("click", () => {
      document.getElementById("orderModal").style.display = "none";
    });

  document.getElementById("orderModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("orderModal")) {
      document.getElementById("orderModal").style.display = "none";
    }
  });

  document
    .getElementById("updateOrderStatusBtn")
    .addEventListener("click", async () => {
      const orderId = document.getElementById("updateOrderStatusBtn").dataset
        .id;
      const status = document.getElementById("orderStatusSelect").value;
      const data = await apiFetch("/orders/update_order_status.php", "POST", {
        id: orderId,
        status,
      });
      if (data.success) {
        showToast("Estado de la orden actualizado", "success");
        document.getElementById("orderModal").style.display = "none";
        loadOrders();
      }
    });
};

// Expose functions globally
window.loadOrders = loadOrders;
window.setupOrderForm = setupOrderForm;
