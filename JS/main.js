import {
  agregarProducto,
  actualizarCarritoDom,
  limpiarCarrito,
} from "./carrito.js";

// Listado de productos, lo declaro vacío al principio y luego se carga desde la APIo desde localStorage
let productos = [];

// Función para cargar productos
async function cargarProductos() {
  try {
    // Intento cargar desde localStorage primero
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
      productos = JSON.parse(productosGuardados);
    } else {
      // Si no hay datos en localStorage, cargar desde API
      const response = await fetch("https://diegocb08.github.io/webcoder/productos.json");
      const data = await response.json();
      productos = data;
      localStorage.setItem("productos", JSON.stringify(data));
    }

    // Una vez cargados los productos, generar la tabla
    generarTablaProductos();
    actualizarCarritoDom();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Función para generar la tabla de productos desde el array
function generarTablaProductos() {
  const productosBody = document.getElementById("productos-body");

  productosBody.innerHTML = ""; // Limpiar contenido existente

  productos.forEach((producto) => {
    const fila = document.createElement("tr");

    // Columna: Nombre
    const nombreCelda = document.createElement("td");
    nombreCelda.id = `nombre-${producto.nombre.toLowerCase()}`;
    nombreCelda.textContent = producto.nombre;
    fila.appendChild(nombreCelda);

    // Columna: Precio
    const precioCelda = document.createElement("td");
    precioCelda.id = `precio-${producto.nombre.toLowerCase()}`;
    precioCelda.innerHTML = `$${producto.precio}`;
    fila.appendChild(precioCelda);

    // Columna: Stock
    const stockCelda = document.createElement("td");
    stockCelda.id = `stock-${producto.nombre.toLowerCase()}`;
    stockCelda.textContent = producto.stock;
    fila.appendChild(stockCelda);

    // Columna: Acción (botón agregar)
    const accionCelda = document.createElement("td");
    const btnAgregar = document.createElement("button");
    if (producto.stock <= 0) {
      btnAgregar.textContent = "Sin Stock";
    } else {
      btnAgregar.textContent = "Agregar al carrito";
    }
    btnAgregar.setAttribute("data-id", producto.id);
    btnAgregar.disabled = producto.stock <= 0;
    accionCelda.appendChild(btnAgregar);
    fila.appendChild(accionCelda);

    productosBody.appendChild(fila);
  });

  // Agrego event listeners a los botones generados
  document.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", function () {
      const productoId = parseInt(button.dataset.id);
      agregarProducto(productoId);

      if (button.textContent !== "Sin Stock") {
        // Reseteo el contador si ya estaba seteado
        if (button.timeoutId) {
          clearTimeout(button.timeoutId);
        }
        button.timeoutId = setTimeout(() => {
          const producto = productos.find((p) => p.id === productoId);
          if (producto && producto.stock > 0) {
            button.textContent = "Agregar al carrito";
          } else {
            button.textContent = "Sin Stock";
          }
        }, 1000);
        button.textContent = "Producto Agregado";
      }
    });
  });
}

// Función para finalizar la compra
function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    Swal.fire({
      title: 'Carrito Vacío',
      text: 'No hay productos en el carrito.',
      icon: 'warning',
      confirmButtonText: 'Ok'
    });
    return;
  }

  // Calcular el total de la compra
  const total = carrito.reduce((sum, item) => {
    return sum + item.precio * item.cantidad;
  }, 0);

  limpiarCarrito(false); // Limpio el carrito sin mostrar el mensaje de "Carrito Vacio"

  Swal.fire({
    title: '¡Compra Finalizada!',
    text: `Total: $${total}. Gracias por su compra.`,
    icon: 'success',
    confirmButtonText: 'Ok'
  });
}

// Inicializar la aplicación
cargarProductos();

// Agregar botones de limpiar carrito y finalizar compra al DOM
const carritoContainer = document.querySelector(".carrito-container");
if (carritoContainer) {
  const botonesContainer = document.createElement("div");
  botonesContainer.className = "carrito-botones";

  const btnLimpiar = document.createElement("button");
  btnLimpiar.id = "btn-limpiar-carrito";
  btnLimpiar.textContent = "Limpiar Carrito";
  btnLimpiar.addEventListener("click", limpiarCarrito);

  const btnFinalizar = document.createElement("button");
  btnFinalizar.id = "btn-finalizar-compra";
  btnFinalizar.textContent = "Finalizar Compra";
  btnFinalizar.addEventListener("click", finalizarCompra);

  botonesContainer.appendChild(btnLimpiar);
  botonesContainer.appendChild(btnFinalizar);

  carritoContainer.appendChild(botonesContainer);
}

export { productos };
