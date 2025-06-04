const BASE_URL = "http://localhost/car_dealership/backend";

const loadSpareParts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/get_spare_parts.php`);
    if (response.data.success) {
      const spareParts = response.data.spare_parts;
      const tbody = document.getElementById("sparePartsBody");
      tbody.innerHTML = spareParts
        .map(
          (sparePart) => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${sparePart.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      sparePart.name
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      sparePart.description || "Sin descripción"
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">$${sparePart.price.toFixed(
                      2
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      sparePart.stock
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      sparePart.category || "Sin categoría"
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="editSparePartBtn bg-yellow-500 text-white px-2 py-1 rounded mr-2" data-id="${
                          sparePart.id
                        }">Editar</button>
                        <button class="deleteSparePartBtn bg-red-500 text-white px-2 py-1 rounded" data-id="${
                          sparePart.id
                        }">Eliminar</button>
                    </td>
                </tr>
            `
        )
        .join("");
      attachSparePartEventListeners();
    }
  } catch (error) {
    showToast("Error al cargar repuestos", "error");
  }
};

const attachSparePartEventListeners = () => {
  document.querySelectorAll(".editSparePartBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const response = await axios.get(
        `${BASE_URL}/get_spare_part.php?id=${id}`
      );
      if (response.data.success) {
        const sparePart = response.data.spare_part;
        document.getElementById("sparePartId").value = sparePart.id;
        document.getElementById("name").value = sparePart.name;
        document.getElementById("description").value =
          sparePart.description || "";
        document.getElementById("price").value = sparePart.price;
        document.getElementById("stock").value = sparePart.stock;
        document.getElementById("category_id").value = sparePart.category
          ? Object.keys(categories).find(
              (key) => categories[key] === sparePart.category
            )
          : "";
        document.getElementById("modalTitle").textContent = "Editar Repuesto";
        document.getElementById("sparePartModal").classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".deleteSparePartBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("¿Estás seguro de eliminar este repuesto?")) {
        const id = btn.dataset.id;
        try {
          await axios.post(`${BASE_URL}/delete_spare_part.php`, { id });
          showToast("Repuesto eliminado correctamente", "success");
          loadSpareParts();
        } catch (error) {
          showToast("Error al eliminar repuesto", "error");
        }
      }
    });
  });
};

const setupSparePartForm = () => {
  document.getElementById("addSparePartBtn").addEventListener("click", () => {
    document.getElementById("sparePartForm").reset();
    document.getElementById("sparePartId").value = "";
    document.getElementById("modalTitle").textContent = "Agregar Repuesto";
    document.getElementById("sparePartModal").classList.remove("hidden");
  });

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("sparePartModal").classList.add("hidden");
  });

  document.getElementById("sparePartModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("sparePartModal")) {
      document.getElementById("sparePartModal").classList.add("hidden");
    }
  });

  document
    .getElementById("sparePartForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("sparePartId").value;
      const data = {
        id,
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        stock: document.getElementById("stock").value,
        category_id: document.getElementById("category_id").value,
      };

      const url = id
        ? `${BASE_URL}/update_spare_part.php`
        : `${BASE_URL}/create_spare_part.php`;
      const method = id ? "POST" : "POST";

      try {
        await axios.post(url, data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        showToast(
          `Repuesto ${id ? "actualizado" : "creado"} correctamente`,
          "success"
        );
        document.getElementById("sparePartModal").classList.add("hidden");
        loadSpareParts();
      } catch (error) {
        showToast(
          `Error al ${id ? "actualizar" : "crear"} repuesto: ${
            error.response.data.message
          }`,
          "error"
        );
      }
    });
};

// Cargar categorías dinámicamente
let categories = {};
const loadCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/get_categories.php`);
    if (response.data.success) {
      const select = document.getElementById("category_id");
      response.data.categories.forEach((category) => {
        categories[category.id] = category.name;
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

// Exponer funciones globalmente
window.loadSpareParts = loadSpareParts;
window.setupSparePartForm = setupSparePartForm;
window.loadCategories = loadCategories;

