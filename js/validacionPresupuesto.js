document.addEventListener("DOMContentLoaded", function () {

  const datos = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    privacidad: false

  }

  const error = {
    nombre: true,
    apellidos: true,
    telefono: true,
    email: true,
    privacidad: true,
    producto: true
  }

  const carrito = new Map(); // idProducto -> { id, nombre, precio, cantidad }
  let productosCache = [];

  const inputNombre = document.getElementById("nombre");
  const inputApellidos = document.getElementById("apellidos");
  const inputTelefono = document.getElementById("telefono");
  const inputCorreo = document.getElementById("email");
  const inputProducto = document.getElementById("producto");
  const inputPrivacidad = document.getElementById("privacidad");
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
  inputPrivacidad.addEventListener('change', validar);
  optionProducto.addEventListener('change', validar);
  inputProducto.addEventListener('change', verDetalles);
  inputPlazo.addEventListener('input', renderDetalles); // recalcula cuota/mes en tiempo real
  btnEnviar.addEventListener('click', enviarDatos);

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
      error[elemento.id] = true;
      return;
    }

    switch (elemento.name) {

      case "nombre":
        if (valor.length > 15 || !soloTexto.test(valor)) {
          mostrarAlerta(`Maximo 15 caracteres y solo letras`, elemento.parentElement)
          error[elemento.name] = true;
          datos[elemento.name] = "";
          return;
        }
        datos[elemento.name] = valor;
        error[elemento.name] = false;
        break;

      case "apellidos":
        if (valor.length > 40 || !soloTexto.test(valor)) {
          mostrarAlerta(`Maximo 40 caracteres y solo letras`, elemento.parentElement)
          error[elemento.name] = true;
          datos[elemento.name] = "";

          return;
        }
        datos[elemento.name] = valor;
        error[elemento.name] = false;
        break;

      case "telefono":
        if (valor.length != 9 || !soloNumeros.test(valor)) {
          mostrarAlerta("9 digitos y solo numeros", elemento.parentElement);
          error[elemento.name] = true;
          datos[elemento.name] = "";

          return;
        }
        datos[elemento.name] = valor;
        error[elemento.name] = false;
        break;

      case "email":
        if (!validarEmail(valor)) {
          mostrarAlerta("Correo invalido", elemento.parentElement)
          error[elemento.name] = true;
          datos[elemento.name] = "";

          return;
        }
        datos[elemento.name] = valor;
        error[elemento.name] = false;
        break;

      case "privacidad":
        if (inputPrivacidad.checked) {
          datos[elemento.name] = true
          error[elemento.name] = false;
          limpiarReferencia(elemento.parentElement);
        } else {
          datos[elemento.name] = false
          error[elemento.name] = true;
          mostrarAlerta("Debes aceptar la política de privacidad", elemento.parentElement);
        }
        break;

      case "producto":
        if (optionProducto.selectedOptions.length > 0) {
          error[elemento.name] = false;
          limpiarReferencia(elemento.parentElement);
        } else {
          error[elemento.name] = true;
          mostrarAlerta("Selecciona al menos un producto", elemento.parentElement);
        }

      default:


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
                  <td colspan="3" style="text-align:right">Plazo (${plazo} ${plazo === 1 ? 'mes' : 'meses'})</td>
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

  function enviarDatos(e) {
    e.preventDefault();
  
    // 1. Revalidamos todos los inputs
    const inputs = [inputNombre, inputApellidos, inputTelefono, inputCorreo, inputPrivacidad, inputProducto];
    inputs.forEach(input => {
      validar({ target: input }); // simulo el evento para cada input
    });
  
    // 2. Revalidamos provacidad (extra por seguridad)
    if (!inputPrivacidad.checked) {
      error.privacidad = true;
      mostrarAlerta("Debes aceptar la política de privacidad", inputPrivacidad.parentElement);
    } else {
      error.privacidad = false;
      limpiarReferencia(inputPrivacidad.parentElement);
    }
  
    // 3. Revalidamos los productos seleccionados
    if (inputProducto.selectedOptions.length === 0) {
      error.producto = true;
      mostrarAlerta("Selecciona al menos un producto", inputProducto.parentElement);
    } else {
      error.producto = false;
      limpiarReferencia(inputProducto.parentElement);
    }
  
    // 4. Comprobar si hay errores
    const hayErrores = Object.values(error).some(Boolean);
    if (hayErrores) {
      alert("Corrige los errores antes de enviar.");
    }else{
      window.location.href = "/";   
    }
  
  }
  

})

function cargarDetalle(id, value) {
  console.log(`id: ${id}, valor: ${value}`);
}