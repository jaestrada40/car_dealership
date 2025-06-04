console.log("Starting to load cars.js...");

const loadCars = async () => {
  try {
    console.log("Loading cars from /cars/get_cars.php...");
    const data = await apiFetch("/cars/get_cars.php");
    console.log("Response from API:", data);
    const carsTableBody = document.getElementById("carsTableBody");
    if (!carsTableBody) {
      console.error("carsTableBody element not found in DOM");
      return;
    }
    if (data.success) {
      if (data.cars && data.cars.length > 0) {
        console.log("Rendering cars:", data.cars);
        carsTableBody.innerHTML = data.cars
          .map(
            (car) => `
              <tr>
                <td>${car.id}</td>
                <td>${car.brand_name}</td>
                <td>${car.model}</td>
                <td>${car.year}</td>
                <td>$${car.price.toLocaleString()}</td>
                <td>${car.color || "N/A"}</td>
                <td>${
                  car.mileage ? car.mileage.toLocaleString() + " km" : "N/A"
                }</td>
                <td>${car.fuel_type}</td>
                <td>${car.transmission}</td>
                <td>${
                  car.image
                    ? `<img src="${
                        car.image
                      }?t=${new Date().getTime()}" alt="Car Image" class="w-10 h-10 rounded-full" />`
                    : "Sin imagen"
                }</td>
                <td>${car.status || "disponible"}</td>
                <td>
                  <button class="editCarBtn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" data-id="${
                    car.id
                  }">Editar</button>
                  <button class="deleteCarBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-id="${
                    car.id
                  }">Eliminar</button>
                </td>
              </tr>
            `
          )
          .join("");
        attachCarEventListeners();
      } else {
        console.log("No cars found in response");
        carsTableBody.innerHTML = `<tr><td colspan="12" class="text-center text-red-500">No se encontraron automóviles.</td></tr>`;
      }
    } else {
      console.log("API returned success: false");
      carsTableBody.innerHTML = `<tr><td colspan="12" class="text-center text-red-500">Error al cargar automóviles: ${
        data.message || "Sin mensaje"
      }</td></tr>`;
    }
  } catch (error) {
    console.error("Error in loadCars:", error);
    const carsTableBody = document.getElementById("carsTableBody");
    if (carsTableBody) {
      carsTableBody.innerHTML = `<tr><td colspan="12" class="text-center text-red-500">Error al cargar automóviles: ${error.message}</td></tr>`;
    }
  }
};
// Cargar marcas para el selector
const loadBrandsForCar = async () => {
  try {
    const data = await apiFetch("/brands/get_brands.php");
    const carBrandSelect = document.getElementById("carBrandId");
    if (data.success && data.brands) {
      carBrandSelect.innerHTML = `<option value="">Seleccione una marca</option>`;
      data.brands.forEach((brand) => {
        carBrandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
      });
    } else {
      carBrandSelect.innerHTML = `<option value="">Error al cargar marcas</option>`;
    }
  } catch (error) {
    console.error("Error loading brands for car:", error);
    document.getElementById(
      "carBrandId"
    ).innerHTML = `<option value="">Error al cargar marcas</option>`;
  }
};

const attachCarEventListeners = () => {
  const editButtons = document.querySelectorAll(".editCarBtn");
  const deleteButtons = document.querySelectorAll(".deleteCarBtn");
  console.log("Found edit buttons:", editButtons.length);
  console.log("Found delete buttons:", deleteButtons.length);

  editButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const carId = btn.dataset.id;
      console.log("Editing car with ID:", carId);
      const data = await apiFetch(`/cars/get_car.php?id=${carId}`);
      console.log("Edit API response:", data);
      if (data.success && data.car) {
        const car = data.car;
        loadBrandsForCar(); 
        document.getElementById("carId").value = car.id;
        document.getElementById("carBrandId").value = car.brand_id;
        document.getElementById("carModel").value = car.model;
        document.getElementById("carYear").value = car.year;
        document.getElementById("carPrice").value = car.price;
        document.getElementById("carColor").value = car.color || "";
        document.getElementById("carMileage").value = car.mileage || "";
        document.getElementById("carFuelType").value = car.fuel_type;
        document.getElementById("carTransmission").value = car.transmission;
        document.getElementById("carDescription").value = car.description || "";
        document.getElementById("carStatus").value = car.status || "disponible";
        document.getElementById("carImage").value = car.image || "";
        document.getElementById("carImageInput").value = ""; // Limpiar el input de archivo
        document.getElementById("carModalTitle").textContent =
          "Editar Automóvil";
        document.getElementById("carModal").style.display = "flex";
      } else {
        showToast("No se pudo cargar el automóvil para edición.", "error");
      }
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const carId = btn.dataset.id;
      console.log("Deleting car with ID:", carId);
      document.getElementById("deleteConfirmModal").style.display = "flex";
      document.getElementById("confirmDeleteBtn").onclick = async () => {
        const data = await apiFetch("/cars/delete_car.php", "POST", {
          id: carId,
        });
        console.log("Delete API response:", data);
        if (data.success) {
          showToast("¡Automóvil eliminado con éxito! 💫", "success");
          document.getElementById("deleteConfirmModal").style.display = "none";
          loadCars();
        } else {
          showToast("Error al eliminar automóvil: " + data.message, "error");
        }
      };
      document.getElementById("cancelDeleteBtn").onclick = () => {
        document.getElementById("deleteConfirmModal").style.display = "none";
      };
    });
  });
};


const setupCarForm = () => {
  console.log("Defining setupCarForm...");
  const createCarBtn = document.getElementById("createCarBtn");
  if (!createCarBtn) {
    console.error("createCarBtn not found in DOM");
    return;
  }
  createCarBtn.addEventListener("click", () => {
    console.log("Create car button clicked");
    document.getElementById("carForm").reset();
    document.getElementById("carId").value = "";
    document.getElementById("carImage").value = "";
    document.getElementById("carModalTitle").textContent =
      "Crear Nuevo Automóvil";
    loadBrandsForCar(); // Cargar marcas al abrir el modal
    document.getElementById("carModal").style.display = "flex";
  });

  const closeCarModalBtn = document.getElementById("closeCarModalBtn");
  if (closeCarModalBtn) {
    closeCarModalBtn.addEventListener("click", () => {
      console.log("Closing car modal");
      document.getElementById("carModal").style.display = "none";
    });
  }

  const carModal = document.getElementById("carModal");
  if (carModal) {
    carModal.addEventListener("click", (e) => {
      if (e.target === carModal) {
        console.log("Click outside car modal, closing...");
        document.getElementById("carModal").style.display = "none";
      }
    });
  }

  const carForm = document.getElementById("carForm");
  if (carForm) {
    carForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Submitting car form");
      const carId = document.getElementById("carId").value;
      const carData = {
        id: carId ? parseInt(carId) : undefined,
        brand_id: parseInt(document.getElementById("carBrandId").value),
        model: document.getElementById("carModel").value,
        year: parseInt(document.getElementById("carYear").value),
        price: parseFloat(document.getElementById("carPrice").value),
        color: document.getElementById("carColor").value || undefined,
        mileage: document.getElementById("carMileage").value
          ? parseInt(document.getElementById("carMileage").value)
          : undefined,
        fuel_type: document.getElementById("carFuelType").value,
        transmission: document.getElementById("carTransmission").value,
        description:
          document.getElementById("carDescription").value || undefined,
        status: document.getElementById("carStatus").value || "disponible",
      };

      // Manejar la subida de imagen
      let imagePath = document.getElementById("carImage").value;
      const imageInput = document.getElementById("carImageInput");
      console.log("Files selected:", imageInput.files);
      if (imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);
        formData.append("folder", "cars"); // Especificar la carpeta para automóviles
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
      carData.image = imagePath || undefined;

      console.log("Sending to API:", carData);
      const url = carId ? "/cars/update_car.php" : "/cars/create_car.php";
      try {
        const data = await apiFetch(url, "POST", carData);
        console.log("API response:", data);
        if (data.success) {
          showToast(
            carId
              ? "Automóvil actualizado exitosamente"
              : "Automóvil creado exitosamente",
            "success"
          );
          document.getElementById("carModal").style.display = "none";
          loadCars();
        } else {
          showToast("Error: " + data.message, "error");
        }
      } catch (error) {
        console.error("Error in form submission:", error);
        showToast("Error al guardar el automóvil: " + error.message, "error");
      }
    });
  } else {
    console.error("carForm not found in DOM");
  }
};

// Expose functions globally
console.log("Exposing loadCars and setupCarForm to window...");
window.loadCars = loadCars;
window.setupCarForm = setupCarForm;
console.log("cars.js fully loaded");
