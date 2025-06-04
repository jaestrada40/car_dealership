// admin/js/dashboard.js

console.log("Starting to load dashboard.js...");

const loadDashboardStats = async () => {
  try {
    console.log("Loading dashboard stats...");
    const [carsData, usersData, brandsData, productsData] = await Promise.all([
      apiFetch("/cars/get_cars.php"),
      apiFetch("/users/get_users.php"),
      apiFetch("/brands/get_brands.php"),
      apiFetch("/spare_parts/get_spare_parts.php"),
    ]);

    if (carsData.success) {
      document.getElementById("totalCars").textContent = carsData.cars.length;
    }
    if (usersData.success) {
      document.getElementById("totalUsers").textContent =
        usersData.users.length;
    }
    if (brandsData.success) {
      document.getElementById("totalBrands").textContent =
        brandsData.brands.length;
    }
    if (productsData.success) {
      document.getElementById("totalProducts").textContent =
        productsData.spare_parts.length;
    }

    // Ya no se configuran gráficos
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    showToast(
      "Error al cargar las estadísticas del dashboard: " + error.message,
      "error"
    );
  }
};

// Exportar función globalmente
console.log("Exposing loadDashboardStats to window...");
window.loadDashboardStats = loadDashboardStats;
console.log("dashboard.js fully loaded");
