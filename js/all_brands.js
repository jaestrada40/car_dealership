// js/all_brands.js

document.addEventListener("DOMContentLoaded", () => {
  const brandsContainer = document.getElementById("brandsGrid");

  fetch("http://localhost/car_dealership/backend/brands/get_brands.php")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) throw new Error("No se pudieron cargar las marcas");

      if (data.brands.length === 0) {
        brandsContainer.innerHTML =
          "<p class='text-gray-500'>No hay marcas disponibles.</p>";
        return;
      }

      data.brands.forEach((brand) => {
        const card = document.createElement("div");
        card.className =
          "bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer";
        card.innerHTML = `
          <img src="${brand.image}" alt="${brand.name}" class="w-full h-40 object-contain mb-4 rounded" />
          <h3 class="text-lg font-semibold text-center">${brand.name}</h3>
        `;
        card.addEventListener("click", () => {
          window.location.href = `brand_cars.html?brand_id=${
            brand.id
          }&brand_name=${encodeURIComponent(brand.name)}`;
        });
        brandsContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      brandsContainer.innerHTML =
        "<p class='text-red-500'>Error al cargar las marcas.</p>";
    });
});
