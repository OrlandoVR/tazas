
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor__productos");
    let productosPath = "../json/productos.json";

    fetch(productosPath)
        .then(res => res.json())
        .then(data => {
            let html = "";
            console.log(data);
            data.forEach(producto => {
                html += `<div>
                  <img src="../images/${producto.imagen}" alt="producto${producto.id}">
                  <div>
                      <p>${producto.nombre}</p>
                      <span>Codigo ${producto.id}</span>
                  </div>
                  <p>${producto.descripcion}</p>
              </div>`;
            });
            contenedor.innerHTML = html;
        })
        .catch(err => 
            console.error("Error cargando productos:", err));

});