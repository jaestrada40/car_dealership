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
              <p class="text-green-700 font-semibold text-lg mb-4">Q${parseFloat(
                part.price
              ).toFixed(2)}</p>
              <button 
                class="quote-button w-full bg-slate-950 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300"
                data-part-id="${part.id}"
              >
                Cotizar
              </button>
            </div>
          `;
          partsGrid.appendChild(card);

          // Evento para abrir modal de cotización
          const btnQuote = card.querySelector(".quote-button");
          btnQuote.addEventListener("click", (e) => {
            const partId = e.currentTarget.getAttribute("data-part-id");
            openQuoteModal(parseInt(partId, 10));
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

  // Función para abrir el modal de cotización
  function openQuoteModal(sparePartId) {
    const modal = document.getElementById("quoteModal");
    const hiddenInput = document.getElementById("sparePartIdField");
    hiddenInput.value = sparePartId; // Llenar el campo oculto
    modal.classList.remove("hidden");
  }

  // Cerrar modal al hacer clic en la X
  const closeBtn = document.getElementById("closeQuoteModalBtn");
  closeBtn.addEventListener("click", () => {
    const modal = document.getElementById("quoteModal");
    modal.classList.add("hidden");
  });

  // Cerrar modal si se clickea fuera del contenido
  document.getElementById("quoteModal").addEventListener("click", (e) => {
    if (e.target.id === "quoteModal") {
      e.target.classList.add("hidden");
    }
  });
});
