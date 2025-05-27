document.addEventListener("DOMContentLoaded", () => {
  const brandCarousel = document.getElementById("brand-carousel");
  if (!brandCarousel) {
    console.error("No se encontró el contenedor brand-carousel");
    return;
  }

  fetch("http://localhost/car_dealership/backend/brands/get_brands.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.success && Array.isArray(data.brands)) {
        brandCarousel.innerHTML = "";

        data.brands.forEach((brand) => {
          const img = document.createElement("img");
          img.src = brand.image || "https://via.placeholder.com/100";
          img.alt = brand.name;
          img.className =
            "w-24 h-24 object-contain rounded-full shadow hover:scale-105 transition";
          brandCarousel.appendChild(img);
        });
      } else {
        brandCarousel.innerHTML =
          "<p class='text-gray-500 text-sm'>No se encontraron marcas.</p>";
      }
    })
    .catch((error) => {
      console.error("Error cargando marcas:", error);
      brandCarousel.innerHTML =
        "<p class='text-red-500'>Error al cargar las marcas.</p>";
    });
});
