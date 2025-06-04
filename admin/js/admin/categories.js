console.log("Starting to load categories.js...");

const loadCategoriesTable = async () => {
  try {
    console.log("Loading categories from /categories/get_category.php...");
    const data = await apiFetch("/categories/get_category.php");
    console.log("Response from API:", data);
    const categoriesTableBody = document.getElementById("categoriesTableBody");
    if (!categoriesTableBody) {
      console.error("categoriesTableBody element not found in DOM");
      return;
    }
    if (data.success) {
      if (data.categories && data.categories.length > 0) {
        console.log("Rendering categories:", data.categories);
        categoriesTableBody.innerHTML = data.categories
          .map(
            (category) => `
              <tr>
                <td>${category.id || "N/A"}</td>
                <td>${category.name || "Sin nombre"}</td>
                <td>${category.description || "Sin descripción"}</td>
                <td>${category.created_at || "N/A"}</td>
                <td>
                  <button class="editCategoryBtn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" data-id="${
                    category.id || ""
                  }">Editar</button>
                  <button class="deleteCategoryBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${
                    category.id || ""
                  }">Eliminar</button>
                </td>
              </tr>
            `
          )
          .join("");
        attachCategoryEventListeners();
      } else {
        console.log("No categories found in response");
        categoriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">No se encontraron categorías.</td></tr>`;
      }
    } else {
      console.log("API returned success: false, message:", data.message);
      categoriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Error al cargar categorías: ${
        data.message || "Sin mensaje"
      }</td></tr>`;
    }
  } catch (error) {
    console.error("Error in loadCategoriesTable:", error);
    const categoriesTableBody = document.getElementById("categoriesTableBody");
    if (categoriesTableBody) {
      categoriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Error al cargar categorías: ${error.message}</td></tr>`;
    }
  }
};

const attachCategoryEventListeners = () => {
  const editButtons = document.querySelectorAll(".editCategoryBtn");
  const deleteButtons = document.querySelectorAll(".deleteCategoryBtn");
  console.log("Found edit buttons:", editButtons.length);
  console.log("Found delete buttons:", deleteButtons.length);

  editButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const categoryId = btn.dataset.id;
      console.log("Editing category with ID:", categoryId);
      const data = await apiFetch(
        `/categories/get_category.php?id=${categoryId}`
      );
      console.log("Edit API response:", data);
      if (data.success && data.categories && data.categories.length > 0) {
        const category = data.categories[0];
        document.getElementById("categoryId").value = category.id || "";
        document.getElementById("categoryName").value = category.name || "";
        document.getElementById("categoryDescription").value =
          category.description || "";
        document.getElementById("categoryModalTitle").textContent =
          "Editar Categoría";
        document.getElementById("categoryModal").style.display = "flex";
      } else {
        showToast(
          "No se pudo cargar la categoría para edición: " +
            (data.message || "Sin datos"),
          "error"
        );
      }
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.dataset.id;
      console.log("Deleting category with ID:", categoryId);
      document.getElementById("deleteConfirmModal").style.display = "flex";
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        const data = await apiFetch("/categories/delete_category.php", "POST", {
          id: categoryId,
        });
        console.log("Delete API response:", data);
        if (data.success) {
          showToast("¡Categoría eliminada con éxito! 💫", "success");
          document.getElementById("deleteConfirmModal").style.display = "none";
          loadCategoriesTable();
        } else {
          showToast("Error al eliminar categoría: " + data.message, "error");
        }
      };
      document.getElementById("cancelDeleteBtn").onclick = () => {
        document.getElementById("deleteConfirmModal").style.display = "none";
      };
    });
  });
};

const setupCategoryForm = () => {
  console.log("Defining setupCategoryForm...");
  const createCategoryBtn = document.getElementById("createCategoryBtn");
  if (!createCategoryBtn) {
    console.error("createCategoryBtn not found in DOM");
    return;
  }
  createCategoryBtn.addEventListener("click", () => {
    console.log("Create category button clicked");
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryId").value = "";
    document.getElementById("categoryModalTitle").textContent =
      "Crear Nueva Categoría";
    document.getElementById("categoryModal").style.display = "flex";
  });

  const closeCategoryModalBtn = document.getElementById(
    "closeCategoryModalBtn"
  );
  if (closeCategoryModalBtn) {
    closeCategoryModalBtn.addEventListener("click", () => {
      console.log("Closing category modal");
      document.getElementById("categoryModal").style.display = "none";
    });
  }

  const categoryModal = document.getElementById("categoryModal");
  if (categoryModal) {
    categoryModal.addEventListener("click", (e) => {
      if (e.target === categoryModal) {
        console.log("Click outside category modal, closing...");
        document.getElementById("categoryModal").style.display = "none";
      }
    });
  }

  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Submitting category form");
      const categoryId = document.getElementById("categoryId").value;
      const categoryData = {
        id: categoryId ? parseInt(categoryId) : undefined,
        name: document.getElementById("categoryName").value,
        description: document.getElementById("categoryDescription").value,
      };

      console.log("Sending to API:", categoryData);
      const url = categoryId
        ? "/categories/update_category.php"
        : "/categories/create_category.php";
      try {
        const data = await apiFetch(url, "POST", categoryData);
        console.log("API response:", data);
        if (data.success) {
          showToast(
            categoryId
              ? "Categoría actualizada exitosamente"
              : "Categoría creada exitosamente",
            "success"
          );
          document.getElementById("categoryModal").style.display = "none";
          loadCategoriesTable();
        } else {
          showToast("Error: " + data.message, "error");
        }
      } catch (error) {
        console.error("Error in form submission:", error);
        showToast("Error al guardar la categoría: " + error.message, "error");
      }
    });
  } else {
    console.error("categoryForm not found in DOM");
  }
};

// Expose functions globally
console.log("Exposing loadCategoriesTable and setupCategoryForm to window...");
window.loadCategoriesTable = loadCategoriesTable;
window.setupCategoryForm = setupCategoryForm;
console.log("categories.js fully loaded");
