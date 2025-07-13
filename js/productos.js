
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor__productos");
    let productosPath = "../json/productos.json";

    fetch(productosPath)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            data.forEach(producto => {
                contenedor.innerHTML += `
              <div>
                  <img src="../images/${producto.imagen}" alt="producto${producto.id}">
                  <div>
                      <p>${producto.nombre}</p>
                      <span>Codigo ${producto.id}</span>
                  </div>
                  <p>${producto.descripcion}</p>
              </div>
          `;
            });
        })
        .catch(err => {
            console.error("Error cargando footer:", err);
        });

});