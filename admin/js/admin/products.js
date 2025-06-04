// admin/js/products.js

// Función para cargar categorías en el dropdown del formulario de producto
let categories = {};
const loadCategoriesForProducts = async () => {
  try {
    console.log("Loading categories for products...");
    const response = await apiFetch("/categories/get_category.php");
    console.log("Categories response:", response);
    if (response.success) {
      const select = document.getElementById("productCategoryId");
      if (!select) {
        console.error("productCategoryId element not found in DOM");
        return;
      }
      // Limpiar opciones existentes (excepto la primera)
      select.innerHTML = '<option value="">Seleccione una categoría</option>';
      categories = {}; // Resetear el objeto de categorías
      response.categories.forEach((category) => {
        categories[category.id] = category.name;
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
      console.log("Categories loaded for products:", categories);
    } else {
      console.error(
        "Failed to load categories for products:",
        response.message
      );
    }
  } catch (error) {
    console.error("Error al cargar categorías para productos:", error);
  }
};

const loadProducts = async () => {
  try {
    const data = await apiFetch("/spare_parts/get_spare_parts.php");
    const productsTableBody = document.getElementById("productsTableBody");
    if (data.success) {
      productsTableBody.innerHTML = data.spare_parts
        .map(
          (product) => `
            <tr>
              <td>${product.id}</td>
              <td>${product.name}</td>
              <td>${product.description || "Sin descripción"}</td>
              <td>$${parseFloat(product.price).toFixed(2)}</td>
              <td>${product.stock}</td>
              <td>${product.category || "Sin categoría"}</td>
              <td>${
                product.image_url
                  ? `<img src="${
                      product.image_url
                    }?t=${new Date().getTime()}" alt="Product Image" class="w-10 h-10 rounded-full" />`
                  : "Sin imagen"
              }</td>
              <td>
                <button class="editProductBtn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" data-id="${
                  product.id
                }">Editar</button>
                <button class="deleteProductBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${
                  product.id
                }">Eliminar</button>
              </td>
            </tr>
          `
        )
        .join("");
      attachProductEventListeners();
    } else {
      productsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500">Error al cargar productos: ${data.message}</td></tr>`;
    }
  } catch (error) {
    const productsTableBody = document.getElementById("productsTableBody");
    productsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500">Error al cargar productos: ${error.message}</td></tr>`;
  }
};

const attachProductEventListeners = () => {
  document.querySelectorAll(".editProductBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      // Cargar categorías antes de llenar el formulario
      await loadCategoriesForProducts();

      const data = await apiFetch(
        `/spare_parts/get_spare_part.php?id=${productId}`
      );
      if (data.success) {
        const product = data.spare_part;
        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name;
        document.getElementById("productDescription").value =
          product.description || "";
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productStock").value = product.stock;

        // Buscar el ID de la categoría basado en el nombre
        const categoryId =
          Object.keys(categories).find(
            (key) => categories[key] === product.category
          ) || "";
        document.getElementById("productCategoryId").value = categoryId;

        document.getElementById("productImage").value = product.image_url || "";
        document.getElementById("productImageInput").value = ""; // Limpiar el input de archivo
        document.getElementById("productModalTitle").textContent =
          "Editar Producto";
        document.getElementById("productModal").style.display = "flex";
      }
    });
  });

  document.querySelectorAll(".deleteProductBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      document.getElementById("deleteConfirmModal").style.display = "flex";
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        const data = await apiFetch(
          "/spare_parts/delete_spare_part.php",
          "POST",
          {
            id: productId,
          }
        );
        if (data.success) {
          showToast("¡Producto eliminado con éxito! 💫", "success");
          document.getElementById("deleteConfirmModal").style.display = "none";
          loadProducts();
        }
      };
      document.getElementById("cancelDeleteBtn").onclick = () => {
        document.getElementById("deleteConfirmModal").style.display = "none";
      };
    });
  });
};

const setupProductForm = () => {
  document
    .getElementById("createProductBtn")
    .addEventListener("click", async () => {
      // Cargar categorías antes de mostrar el modal
      await loadCategoriesForProducts();

      document.getElementById("productForm").reset();
      document.getElementById("productId").value = "";
      document.getElementById("productImage").value = "";
      document.getElementById("productModalTitle").textContent =
        "Crear Nuevo Producto";
      document.getElementById("productModal").style.display = "flex";
    });

  document
    .getElementById("closeProductModalBtn")
    .addEventListener("click", () => {
      document.getElementById("productModal").style.display = "none";
    });

  document.getElementById("productModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("productModal")) {
      document.getElementById("productModal").style.display = "none";
    }
  });

  document
    .getElementById("productForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const productId = document.getElementById("productId").value;
      const productData = {
        id: productId ? parseInt(productId) : undefined, // Convertir id a entero
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: document.getElementById("productPrice").value,
        stock: document.getElementById("productStock").value,
        category_id: document.getElementById("productCategoryId").value,
      };

      // Manejar la subida de imagen
      let imagePath = document.getElementById("productImage").value;
      const imageInput = document.getElementById("productImageInput");
      console.log("Files selected:", imageInput.files);
      if (imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);
        formData.append("folder", "spare_parts"); // Especificar la carpeta para productos
        console.log("Uploading file:", imageInput.files[0].name);
        const uploadResponse = await apiFetch(
          "/upload_image.php",
          "POST",
          formData,
          true
        );
        console.log("Upload response:", uploadResponse);
        if (uploadResponse.success) {
          imagePath = uploadResponse.image_path;
        } else {
          showToast(
            "Error al subir la imagen: " + uploadResponse.message,
            "error"
          );
          return;
        }
      }
      productData.image = imagePath || undefined;

      console.log("Sending to API:", productData);
      const url = productId
        ? "/spare_parts/update_spare_part.php"
        : "/spare_parts/create_spare_part.php";
      try {
        const data = await apiFetch(url, "POST", productData);
        if (data.success) {
          showToast(
            productId
              ? "Producto actualizado exitosamente"
              : "Producto creado exitosamente",
            "success"
          );
          document.getElementById("productModal").style.display = "none";
          loadProducts();
        } else {
          showToast("Error: " + data.message, "error");
        }
      } catch (error) {
        showToast("Error al guardar el producto: " + error.message, "error");
      }
    });
};

// Exponer funciones globalmente
window.loadProducts = loadProducts;
window.setupProductForm = setupProductForm;
window.loadCategoriesForProducts = loadCategoriesForProducts;
