document.addEventListener("DOMContentLoaded", function () {

    const datos = {
        nombre: '',
        apellidos: '',
        telefono: '',
        correo: ''
    }

    const carrito = new Map(); // idProducto -> { id, nombre, precio, cantidad }
    let productosCache = [];

    const inputNombre = document.getElementById("nombre");
    const inputApellidos = document.getElementById("apellidos");
    const inputTelefono = document.getElementById("telefono");
    const inputCorreo = document.getElementById("email");
    const inputProducto = document.getElementById("producto");
    const btnEnviar = document.getElementById("enviar");
    const productosSeleccionadoCantidad = document.getElementById("productosSeleccionadoCantidad");
    const optionProducto = document.getElementById("producto");
    const inputPlazo = document.getElementById("plazo");
const detallesPedido = document.getElementById("detallesPedido");
const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });


    inputNombre.addEventListener('input', validar);
    inputApellidos.addEventListener('input', validar);
    inputTelefono.addEventListener('input', validar);
    inputCorreo.addEventListener('input', validar);
    inputProducto.addEventListener('change', verDetalles);
    inputPlazo.addEventListener('input', renderDetalles); // recalcula cuota/mes en tiempo real


    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        location.reload();
        alert("Formulario enviado");
      });

    let productosPath = "../json/productos.json";

    mostrarOpcionesTazas();


    function validar(e) {
        const soloTexto = /^[A-Za-z\s]+$/;
        const soloNumeros = /^[0-9]+$/;

        limpiarReferencia(e.target.parentElement);
        const elemento = e.target;
        const valor = elemento.value.trim();

        if (valor === '') {
            mostrarAlerta(`El campo ${elemento.id} es obligatorio`, elemento.parentElement)
            datos[elemento.name] = '';
            return;
        }

        switch (elemento.name) {

            case "nombre":
                console.log(valor.length);
                if (valor.length > 15 || !soloTexto.test(valor)) {
                    mostrarAlerta(`Maximo 15 caracteres y solo letras`, elemento.parentElement)
                    return;
                }
                datos[elemento.name] = valor;
                break;

            case "apellidos":
                if (valor.length > 40 || !soloTexto.test(valor)) {
                    mostrarAlerta(`Maximo 40 caracteres y solo letras`, elemento.parentElement)
                    return;
                }
                datos[elemento.name] = valor;
                break;

            case "telefono":
                if (valor.length > 9 || !soloNumeros.test(valor)) {
                    mostrarAlerta("Maximo 9 numeros y solo numeros", elemento.parentElement);
                    return;
                }
                datos[elemento.name] = valor;
                break;

            case "email":
                console.log("ddd");
                if (!validarEmail(valor)) {
                    mostrarAlerta("Correo invalido", elemento.parentElement)
                    return;
                }
                datos[elemento.name] = valor;
                break;

            default:
                datos[elemento.name] = valor;

        }

    }

    function mostrarAlerta(mensaje, referencia) {
        limpiarReferencia(referencia);

        const error = document.createElement('p');
        error.textContent = mensaje;
        error.classList.add("error-alerta");

        referencia.appendChild(error);
    }

    function limpiarReferencia(referencia) {
        const alerta = referencia.querySelector(".error-alerta");
        if (alerta) {
            alerta.remove();
        }
    }

    function validarEmail(email) {
        const regex = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        const resultado = regex.test(email);
        return resultado;
    }

    function verDetalles(e) {

        const idsSeleccionados = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value, 10));
        const productosSeleccionados = productosCache.filter(p => idsSeleccionados.includes(p.id));

        // Generar inputs de cantidad (min 1) y poblar carrito con cantidad 1 por defecto
        productosSeleccionadoCantidad.innerHTML = '';
        productosSeleccionados.forEach(p => {
            // si no está ya en carrito, inicializa a 1
            if (!carrito.has(p.id)) {
                carrito.set(p.id, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 });
            }

            const label = document.createElement('label');
            label.setAttribute('for', `prod_${p.id}`);
            label.textContent = p.nombre + ' (unidad: ' + fmt.format(p.precio) + ')';

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `prod_${p.id}`;
            input.name = `producto${p.id}`;
            input.min = '0';
            input.step = '1';
            input.value = carrito.get(p.id)?.cantidad ?? 1; // mantener si ya estaba

            input.addEventListener('input', () => {
                const qty = parseInt(input.value, 10) || 0;
                actualizarCantidad(p.id, p.nombre, p.precio, qty);
            });

            productosSeleccionadoCantidad.appendChild(label);
            productosSeleccionadoCantidad.appendChild(input);
            productosSeleccionadoCantidad.appendChild(document.createElement('br'));
        });

        // Eliminar del carrito los productos que ya no están seleccionados
        for (const key of Array.from(carrito.keys())) {
            if (!idsSeleccionados.includes(key)) carrito.delete(key);
        }

        renderDetalles();

    }

    function actualizarCantidad(id, nombre, precio, cantidad) {
        if (cantidad <= 0) {
          carrito.delete(id);
        } else {
          carrito.set(id, { id, nombre, precio, cantidad });
        }
        renderDetalles();
      }

      function renderDetalles() {
        if (carrito.size === 0) {
          detallesPedido.innerHTML = `
            <h2>Detalles del pedido</h2>
            <p>No hay detalles ...</p>
          `;
          return;
        }
    
        let total = 0;
        let filas = '';
        carrito.forEach(item => {
          const subtotal = item.precio * item.cantidad;
          total += subtotal;
          filas += `
            <tr>
              <td>${item.nombre}</td>
              <td style="text-align:right">${item.cantidad}</td>
              <td style="text-align:right">${fmt.format(item.precio)}</td>
              <td style="text-align:right"><strong>${fmt.format(subtotal)}</strong></td>
            </tr>`;
        });
    
        const plazo = parseInt(inputPlazo.value, 10) || 0;
        const cuota = (plazo > 0) ? total / plazo : 0;
    
        detallesPedido.innerHTML = `
          <h2>Detalles del pedido</h2>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:right">Cantidad</th>
                  <th style="text-align:right">Precio</th>
                  <th style="text-align:right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${filas}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align:right">Total</td>
                  <td style="text-align:right"><strong>${fmt.format(total)}</strong></td>
                </tr>
                ${plazo > 0 ? `
                <tr>
                  <td colspan="3" style="text-align:right">Plazo (${plazo} ${plazo===1?'mes':'meses'})</td>
                  <td style="text-align:right"><strong>${fmt.format(cuota)}</strong> / mes</td>
                </tr>` : ``}
              </tfoot>
            </table>
          </div>
        `;
      }

    function mostrarOpcionesTazas() {

        fetch(productosPath)
            .then(res => res.json())
            .then(data => {

                productosCache = data; // cache
                optionProducto.innerHTML = data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

            });

    }
})

function cargarDetalle(id, value) {
    console.log(`id: ${id}, valor: ${value}`);
}