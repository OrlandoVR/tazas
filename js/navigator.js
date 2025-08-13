
document.addEventListener("DOMContentLoaded", () => {

  const navigatorEl = document.getElementById("nav-placeholder");
  const isInPages = window.location.pathname.includes("/pages/");

  const basePath = isInPages ? "../" : "";

  navigatorEl.innerHTML = `
      <nav class="navegacion">
        <div class="navegacion__contenedor">
          <a href="${basePath}index.html" class="navegacion__logo">
            <img src="${basePath}images/logo.png" alt="Logo" height="50px">
          </a>

          <input type="checkbox" id="menu-toggle" class="menu-toggle">
          <label for="menu-toggle" class="menu-icon">
            <i class="fas fa-bars"></i>
          </label>

        <div class="navegacion__menu">
            <ul id="lista-opciones">
            <li><a href="${basePath}index.html">Inicio</a></li>
            <li><a href="${basePath}pages/productos.html">Productos</a></li>
            <li><a href="${basePath}pages/presupuesto.html">Presupuesto</a></li>
            <li><a href="${basePath}pages/contacto.html">Contacto</a></li>
            </ul>
        </div>
        </div>
      </nav>      
      `
});

