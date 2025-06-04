document.addEventListener("DOMContentLoaded", () => {
  console.log("brands.js cargado correctamente");

  const brandGrid = document.getElementById("brandGrid");
  const loadingBrands = document.getElementById("loadingBrands");
  const noBrands = document.getElementById("noBrands");

  if (!brandGrid || !loadingBrands || !noBrands) {
    console.error(
      "No se encontraron los contenedores brandGrid, loadingBrands o noBrands"
    );
    return;
  }

  // Mostrar indicador de carga
  loadingBrands.classList.remove("hidden");

  // Función para crear una tarjeta de marca
  function createBrandCard(brand) {
    const div = document.createElement("div");
    div.className = "brand-card";
    div.innerHTML = `
      <img src="${brand.image || "https://placehold.co/300x200"}" alt="${
      brand.name
    }" class="w-full h-40 object-contain mb-4 rounded" />
      <h3 class="text-lg font-semibold text-center">${brand.name}</h3>
    `;
    div.addEventListener("click", () => {
      window.location.href = `http://localhost/car_dealership/brand_cars.html?brand_id=${
        brand.id
      }&brand_name=${encodeURIComponent(brand.name)}`;
    });
    console.log(`Tarjeta creada para ${brand.name}`);
    return div;
  }

  // Cargar marcas desde el backend
  fetch("http://localhost/car_dealership/backend/brands/get_brands.php")
    .then((res) => {
      console.log("Respuesta del servidor:", res);
      return res.json();
    })
    .then((data) => {
      loadingBrands.classList.add("hidden");
      console.log("Datos recibidos:", data);
      if (data.success && Array.isArray(data.brands)) {
        brandGrid.innerHTML = "";
        data.brands.forEach((brand) => {
          const card = createBrandCard(brand);
          brandGrid.appendChild(card);
        });
      } else {
        noBrands.classList.remove("hidden");
        console.log(
          "No se encontraron marcas o el formato de datos es incorrecto"
        );
      }
    })
    .catch((error) => {
      loadingBrands.classList.add("hidden");
      noBrands.classList.remove("hidden");
      noBrands.innerHTML =
        "<p class='text-red-500'>Error al cargar las marcas.</p>";
      console.error("Error cargando marcas:", error);
    });
});
