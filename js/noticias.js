document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".noticias__tarjetas");
    console.log(contenedor);
    let productosPath = "json/noticias.json";

    fetch(productosPath)
        .then(res => res.json())
        .then(data => {
            let html = ""
            data.forEach(noticia => {
                html += `
                    <div class="noticias__tarjeta">
                        <img src="${noticia.image}" alt="">
                        <p>${noticia.descripcion}</p>
                        <div>
                            <span> <b>Seguir leyendo</b> </span>
                            <button class="btn btn-link">
                            <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>`
            });
            contenedor.innerHTML = html;
        });
});