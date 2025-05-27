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
            "bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition";

          const imageUrl = part.image_url
            ? part.image_url
            : "https://via.placeholder.com/300x200";

          card.innerHTML = `
            <img src="${imageUrl}" alt="${
            part.name
          }" class="w-full h-40 object-contain mb-4" />
            <h3 class="text-lg font-semibold">${part.name}</h3>
            <p class="text-gray-600 text-sm">${part.description || ""}</p>
            <p class="text-blue-600 font-bold text-lg mt-1">Q${parseFloat(
              part.price
            ).toFixed(2)}</p>
            <button class="add-to-cart mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Agregar al carrito
            </button>
          `;

          partsGrid.appendChild(card);

          // Agregar evento al botón
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
            alert(`${part.name} agregado al carrito`);
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
