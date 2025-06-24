const jsonBase = location.pathname.includes("/html/") ? "../" : "";

fetch(`${jsonBase}json/productos.json`)
  .then(res => res.json())
  .then(data => {
      const contenedor = document.getElementById("contenedor__productos");
      data.forEach(producto => {
          contenedor.innerHTML += `
              <div>
                  <img src="${producto.imagen}" alt="producto${producto.id}">
                  <div>
                      <p>${producto.nombre}</p>
                      <span>Codigo ${producto.id}</span>
                  </div>
                  <p>${producto.descripcion}</p>
              </div>
          `;
      });
  });