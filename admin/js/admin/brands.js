console.log("Starting to load brands.js...");

const loadBrands = async () => {
  try {
    console.log("Loading brands from /brands/get_brands.php...");
    const data = await apiFetch("/brands/get_brands.php");
    console.log("Response from API:", data);
    const brandsTableBody = document.getElementById("brandsTableBody");
    if (!brandsTableBody) {
      console.error("brandsTableBody element not found in DOM");
      return;
    }
    if (data.success) {
      if (data.brands && data.brands.length > 0) {
        console.log("Rendering brands:", data.brands);
        brandsTableBody.innerHTML = data.brands
          .map(
            (brand) => `
              <tr>
                <td>${brand.id}</td>
                <td>${brand.name}</td>
                <td>${
                  brand.image
                    ? `<img src="${
                        brand.image
                      }?t=${new Date().getTime()}" alt="Brand Image" class="w-10 h-10 rounded-full" />`
                    : "Sin imagen"
                }</td>

                <td>
                  <button class="editBrandBtn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" data-id="${
                    brand.id
                  }">Editar</button>
                  <button class="deleteBrandBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${
                    brand.id
                  }">Eliminar</button>
                </td>
              </tr>
            `
          )
          .join("");
        attachBrandEventListeners();
      } else {
        console.log("No brands found in response");
        brandsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">No se encontraron marcas.</td></tr>`;
      }
    } else {
      console.log("API returned success: false");
      brandsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Error al cargar marcas: ${
        data.message || "Sin mensaje"
      }</td></tr>`;
    }
  } catch (error) {
    console.error("Error in loadBrands:", error);
    const brandsTableBody = document.getElementById("brandsTableBody");
    if (brandsTableBody) {
      brandsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Error al cargar marcas: ${error.message}</td></tr>`;
    }
  }
};

const attachBrandEventListeners = () => {
  const editButtons = document.querySelectorAll(".editBrandBtn");
  const deleteButtons = document.querySelectorAll(".deleteBrandBtn");
  console.log("Found edit buttons:", editButtons.length);
  console.log("Found delete buttons:", deleteButtons.length);

  editButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const brandId = btn.dataset.id;
      console.log("Editing brand with ID:", brandId);
      const data = await apiFetch(`/brands/get_brands.php?id=${brandId}`);
      console.log("Edit API response:", data);
      if (data.success && data.brands && data.brands.length > 0) {
        const brand = data.brands[0];
        document.getElementById("brandId").value = brand.id;
        document.getElementById("brandName").value = brand.name;
        document.getElementById("brandImage").value = brand.image || "";
        document.getElementById("brandImageInput").value = ""; // Limpiar el input de archivo
        document.getElementById("brandModalTitle").textContent = "Editar Marca";
        document.getElementById("brandModal").style.display = "flex";
      } else {
        showToast("No se pudo cargar la marca para edición.", "error");
      }
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const brandId = btn.dataset.id;
      console.log("Deleting brand with ID:", brandId);
      document.getElementById("deleteConfirmModal").style.display = "flex";
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        const data = await apiFetch("/brands/delete_brand.php", "POST", {
          id: brandId,
        });
        console.log("Delete API response:", data);
        if (data.success) {
          showToast("¡Marca eliminada con éxito! 💫", "success");
          document.getElementById("deleteConfirmModal").style.display = "none";
          loadBrands();
        } else {
          showToast("Error al eliminar marca: " + data.message, "error");
        }
      };
      document.getElementById("cancelDeleteBtn").onclick = () => {
        document.getElementById("deleteConfirmModal").style.display = "none";
      };
    });
  });
};

const setupBrandForm = () => {
  console.log("Defining setupBrandForm...");
  const createBrandBtn = document.getElementById("createBrandBtn");
  if (!createBrandBtn) {
    console.error("createBrandBtn not found in DOM");
    return;
  }
  createBrandBtn.addEventListener("click", () => {
    console.log("Create brand button clicked");
    document.getElementById("brandForm").reset();
    document.getElementById("brandId").value = "";
    document.getElementById("brandImage").value = "";
    document.getElementById("brandModalTitle").textContent =
      "Crear Nueva Marca";
    document.getElementById("brandModal").style.display = "flex";
  });

  const closeBrandModalBtn = document.getElementById("closeBrandModalBtn");
  if (closeBrandModalBtn) {
    closeBrandModalBtn.addEventListener("click", () => {
      console.log("Closing brand modal");
      document.getElementById("brandModal").style.display = "none";
    });
  }

  const brandModal = document.getElementById("brandModal");
  if (brandModal) {
    brandModal.addEventListener("click", (e) => {
      if (e.target === brandModal) {
        console.log("Click outside brand modal, closing...");
        document.getElementById("brandModal").style.display = "none";
      }
    });
  }

  const brandForm = document.getElementById("brandForm");
  if (brandForm) {
    brandForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Submitting brand form");
      const brandId = document.getElementById("brandId").value;
      const brandData = {
        id: brandId ? parseInt(brandId) : undefined,
        name: document.getElementById("brandName").value,
      };

      // Manejar la subida de imagen
      let imagePath = document.getElementById("brandImage").value;
      const imageInput = document.getElementById("brandImageInput");
      console.log("Files selected:", imageInput.files);
      if (imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);
        formData.append("folder", "brands"); // Especificar la carpeta para marcas
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
      brandData.image = imagePath || undefined;

      console.log("Sending to API:", brandData);
      const url = brandId
        ? "/brands/update_brand.php"
        : "/brands/create_brand.php";
      try {
        const data = await apiFetch(url, "POST", brandData);
        console.log("API response:", data);
        if (data.success) {
          showToast(
            brandId
              ? "Marca actualizada exitosamente"
              : "Marca creada exitosamente",
            "success"
          );
          document.getElementById("brandModal").style.display = "none";
          loadBrands();
        } else {
          showToast("Error: " + data.message, "error");
        }
      } catch (error) {
        console.error("Error in form submission:", error);
        showToast("Error al guardar la marca: " + error.message, "error");
      }
    });
  } else {
    console.error("brandForm not found in DOM");
  }
};

// Expose functions globally
console.log("Exposing loadBrands and setupBrandForm to window...");
window.loadBrands = loadBrands;
window.setupBrandForm = setupBrandForm;
console.log("brands.js fully loaded");
