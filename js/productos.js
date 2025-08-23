
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor__productos");
    let productosPath = "../json/productos.json";

    const productosById = new Map();

    fetch(productosPath)
        .then(res => res.json())
        .then(data => {
            // guarda los productos en memoria por id
            data.forEach(p => productosById.set(String(p.id), p));

            // pinta los cards; sólo guarda el id en data-id
            const cardsHtml = data.map(p => `
        <div class="card h-100 shadow-sm producto" data-id="${p.id}" style="cursor:pointer">
          <img src="../../images/${p.imagen}" class="card-img-top" alt="producto ${p.id}">
          <div class="card-body">
            <h5 class="card-title mb-1">${p.nombre}</h5>
            <small class="text-muted">Código ${p.id}</small>
            <p class="card-text mt-2">${p.descripcion}</p>
          </div>
        </div>
      `).join("");

            contenedor.innerHTML = cardsHtml;
        })
        .catch(err => console.error("Error cargando productos:", err));


    contenedor.addEventListener("click", (e) => {
        const card = e.target.closest(".producto");
        if (!card) return;

        const id = card.dataset.id;
        const p = productosById.get(id);
        if (!p) return;

        // rellena el modal con los datos del producto
        const modalEl = document.getElementById("productoModal");
        modalEl.querySelector(".modal-title").textContent = p.nombre;

        const imgEl = modalEl.querySelector('[data-role="modal-img"]');
        imgEl.src = `../../images/${p.imagen}`;
        imgEl.alt = `producto ${p.id}`;

        modalEl.querySelector('[data-role="modal-desc"]').textContent = p.descripcion;

        // abre el modal programáticamente
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });

});