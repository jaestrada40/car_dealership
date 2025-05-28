document.addEventListener("DOMContentLoaded", () => {
  const partsGrid = document.getElementById("partsGrid");

  fetch(
    "http://localhost/car_dealership/backend/spare_parts/get_spare_parts.php"
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.success && Array.isArray(data.spare_parts)) {
        partsGrid.innerHTML = "";

        data.spare_parts.forEach((part) => {
          const card = document.createElement("div");
          card.className =
            "bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300";
          card.innerHTML = `
            <img
              src="${part.image_url || "https://via.placeholder.com/300x200"}"
              alt="${part.name}"
              class="w-full h-48 object-contain rounded-t-xl"
            />
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">${part.name}</h3>
              <p class="text-gray-600 text-sm mb-3">${
                part.description || ""
              }</p>
              <p class="text-blue-600 font-semibold text-lg mb-4">Q${parseFloat(
                part.price
              ).toFixed(2)}</p>
              <button class="add-to-cart w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                Agregar al carrito
              </button>
            </div>
          `;
          partsGrid.appendChild(card);

          const button = card.querySelector(".add-to-cart");
          button.addEventListener("click", () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existing = cart.find((item) => item.id === part.id);
            if (existing) {
              existing.quantity += 1;
            } else {
              cart.push({ ...part, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            Toastify({
              text: `¡${part.name} agregado al carrito!`,
              duration: 3000,
              gravity: "top",
              position: "right",
              backgroundColor: "#2563eb",
              className: "font-roboto text-sm",
              stopOnFocus: true,
            }).showToast();
            if (window.updateCartBadge) {
              window.updateCartBadge();
            }
          });
        });
      } else {
        partsGrid.innerHTML = `<p class="text-center text-gray-500">No se encontraron repuestos.</p>`;
      }
    })
    .catch((error) => {
      console.error("Error cargando repuestos:", error);
      partsGrid.innerHTML = `<p class="text-center text-red-500">Error al cargar los repuestos.</p>`;
    });
});
