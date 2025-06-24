const contenedor = document.getElementById("contenedor__productos");
console.log(contenedor);

fetch("json/productos.json")
    .then(res => res.json())
    .then(data => {
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
    })