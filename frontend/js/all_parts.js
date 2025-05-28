// js/all_parts.js

document.addEventListener("DOMContentLoaded", () => {
  const partsGrid = document.getElementById("partsGrid");
  const searchInput = document.getElementById("partSearchInput");

  if (!partsGrid) {
    console.error("Elemento #partsGrid no encontrado en el DOM.");
    return;
  }

  let allParts = [];

  async function loadParts() {
    try {
      const res = await fetch(
        "http://localhost/car_dealership/backend/spare_parts/get_spare_parts.php"
      );
      const data = await res.json();

      if (!data.success || !Array.isArray(data.spare_parts)) {
        throw new Error("Respuesta inválida del servidor");
      }

      allParts = data.spare_parts;
      renderParts(allParts);
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
      partsGrid.innerHTML = `<p class="text-red-500 col-span-full text-center">Error al cargar los repuestos.</p>`;
    }
  }

  function renderParts(parts) {
    partsGrid.innerHTML = "";

    if (parts.length === 0) {
      partsGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">No hay repuestos que coincidan.</p>`;
      return;
    }

    parts.forEach((part) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded shadow p-4 hover:shadow-lg transition";
      card.innerHTML = `
        <img src="${part.image_url}" alt="${part.name}" class="w-full h-40 object-contain mb-4 rounded" />
        <h3 class="text-lg font-semibold mb-1">${part.name}</h3>
        <p class="text-sm text-gray-500 mb-2">${part.category}</p>
        <p class="text-blue-600 font-bold mb-2">Q${part.price}</p>
        <button class="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition">Agregar al carrito</button>
      `;
      partsGrid.appendChild(card);
    });
  }

  function applySearch() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allParts.filter(
      (part) =>
        part.name.toLowerCase().includes(keyword) ||
        (part.category && part.category.toLowerCase().includes(keyword))
    );
    renderParts(filtered);
  }

  if (searchInput) {
    const searchInput = document.getElementById("searchInput");
  }

  loadParts();
});
