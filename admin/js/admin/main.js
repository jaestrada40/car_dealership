// admin/js/admin/main.js

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Verificar autenticación
  console.log("Checking authentication...");
  const userData = await checkAuth();
  if (!userData) {
    console.log("Authentication failed, exiting...");
    return;
  }

  // 2) Referencias a navs y secciones
  const navDashboard = document.getElementById("navDashboard");
  const navUsers = document.getElementById("navUsers");
  const navProducts = document.getElementById("navProducts");
  const navCategories = document.getElementById("navCategories");
  const navBrands = document.getElementById("navBrands");
  const navCars = document.getElementById("navCars");
  const navQuotes = document.getElementById("navQuotes");
  const navAppointments = document.getElementById("navAppointments");

  const dashboardSection = document.getElementById("dashboardSection");
  const usersSection = document.getElementById("usersSection");
  const productsSection = document.getElementById("productsSection");
  const categoriesSection = document.getElementById("categoriesSection");
  const brandsSection = document.getElementById("brandsSection");
  const carsSection = document.getElementById("carsSection");
  const quotesSection = document.getElementById("quotesSection");
  const appointmentsSection = document.getElementById("appointmentsSection");

  const logoutBtn = document.getElementById("logoutBtn");

  // 3) Lista de todos los tabs del sidebar (para quitar 'tab-active')
  const allTabs = [
    navDashboard,
    navUsers,
    navProducts,
    navCategories,
    navBrands,
    navCars,
    navQuotes,
    navAppointments,
  ];

  // 4) Mapa de IDs a { botón, sección, loader }
  const navMap = {
    navDashboard: {
      tab: navDashboard,
      section: dashboardSection,
      loader: window.loadDashboardStats,
    },
    navUsers: {
      tab: navUsers,
      section: usersSection,
      loader: window.loadUsers,
    },
    navProducts: {
      tab: navProducts,
      section: productsSection,
      loader: window.loadProducts,
    },
    navCategories: {
      tab: navCategories,
      section: categoriesSection,
      loader: window.loadCategoriesTable,
    },
    navBrands: {
      tab: navBrands,
      section: brandsSection,
      loader: window.loadBrands,
    },
    navCars: {
      tab: navCars,
      section: carsSection,
      loader: window.loadCars,
    },
    navQuotes: {
      tab: navQuotes,
      section: quotesSection,
      loader: window.loadQuotes,
    },
    navAppointments: {
      tab: navAppointments,
      section: appointmentsSection,
      loader: window.loadAppointments,
    },
  };

  // 5) Función para cambiar pestaña
  const switchTab = (activeTab, activeSection, loadFunction) => {
    // Quitar 'tab-active' de todos los tabs
    allTabs.forEach((tab) => {
      if (tab) tab.classList.remove("tab-active");
    });

    // Ocultar todas las secciones
    [
      dashboardSection,
      usersSection,
      productsSection,
      categoriesSection,
      brandsSection,
      carsSection,
      quotesSection,
      appointmentsSection,
    ].forEach((sec) => {
      if (sec) sec.classList.add("hidden");
    });

    // Marcar el tab activo
    activeTab.classList.add("tab-active");
    // Mostrar la sección correspondiente
    if (activeSection) activeSection.classList.remove("hidden");

    // Guardar en localStorage cuál pestaña está activa
    localStorage.setItem("activeTab", activeTab.id);

    // Si hay función para cargar datos, ejecútala
    if (loadFunction) {
      console.log(`Loading data for ${activeTab.id}...`);
      loadFunction();
    }
  };

  // 6) Leer pestaña guardada o usar dashboard por defecto
  const savedTabId = localStorage.getItem("activeTab") || "navDashboard";
  if (navMap[savedTabId]) {
    const entry = navMap[savedTabId];
    switchTab(entry.tab, entry.section, entry.loader);
  } else {
    switchTab(navDashboard, dashboardSection, window.loadDashboardStats);
  }

  // 7) Asignar eventos de click a cada tab
  navDashboard.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navDashboard, dashboardSection, window.loadDashboardStats);
  });

  navUsers.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navUsers, usersSection, window.loadUsers);
  });

  navProducts.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navProducts, productsSection, window.loadProducts);
  });

  navCategories.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navCategories, categoriesSection, window.loadCategoriesTable);
  });

  navBrands.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navBrands, brandsSection, window.loadBrands);
  });

  navCars.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navCars, carsSection, window.loadCars);
  });

  navQuotes.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navQuotes, quotesSection, window.loadQuotes);
  });

  navAppointments.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab(navAppointments, appointmentsSection, window.loadAppointments);
  });

  // 8) Configurar formularios y modales si existen
  if (typeof window.setupUserForm === "function") window.setupUserForm();
  if (typeof window.setupProductForm === "function") window.setupProductForm();
  if (typeof window.setupCategoryForm === "function")
    window.setupCategoryForm();
  if (typeof window.setupBrandForm === "function") window.setupBrandForm();
  if (typeof window.setupCarForm === "function") window.setupCarForm();
  if (typeof window.setupQuoteForm === "function") window.setupQuoteForm();
  if (typeof window.setupAppointmentForm === "function")
    window.setupAppointmentForm();

  // 9) Configurar logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/car_dealership/index.html";
  });
});
