// Importar funciones de filtrado
import {
  filtrarPorNombre,
  filtrarPorPrecio,
  aplicarFiltros,
  actualizarProductosFiltrados,
  limpiarFiltros,
} from "./filtros.js";

// Importar funciones del carrito
import {
  agregarProducto,
  actualizarCarritoDom,
  limpiarCarrito,
} from "./carrito.js";

// Listado de productos, lo declaro vacío al principio y luego se carga desde la API o desde localStorage
let productos = [];

// ===== FUNCIONES DE INICIALIZACIÓN =====

// Función para cargar productos
async function cargarProductos() {
  try {
    // Intento cargar desde localStorage primero
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
      productos = JSON.parse(productosGuardados);
    } else {
      // Si no hay datos en localStorage, cargar desde API
      const response = await fetch(
        "https://diegocb08.github.io/webcoder/productos.json"
      );
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      productos = data;
      localStorage.setItem("productos", JSON.stringify(data));
    }

    // Mostrar todos los productos al cargar
    mostrarProductos(productos);
    actualizarCarritoDom();
  } catch (error) {
    Swal.fire({
      title: "Error al cargar productos",
      text: "No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.",
      icon: "error",
      confirmButtonText: "Entendido",
    });
    console.error("Error detallado al cargar productos:", error); // Entiendo que pidieron eliminar logs, pero creo que console error es útil para ver el tipo de error que ocurr
  }
}

// ===== FUNCIONES DE UI =====

// Función para mostrar productos en el grid
function mostrarProductos(productosAMostrar) {
  const productosGrid = document.getElementById("productos-grid");
  productosGrid.innerHTML = ""; // Limpiar el grid

  productosAMostrar.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "producto-card";

    // Imagen del Producto
    const img = document.createElement("img");
    img.src = producto.imagenUrl;
    img.alt = producto.nombre;
    img.className = "producto-imagen";
    card.appendChild(img);

    // Contenedor de información
    const infoContainer = document.createElement("div");
    infoContainer.className = "producto-info";

    // Nombre del Producto
    const nombre = document.createElement("h3");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre;
    infoContainer.appendChild(nombre);

    // Precio del Producto
    const precio = document.createElement("p");
    precio.className = "producto-precio";
    precio.innerHTML = `$${producto.precio}`;
    infoContainer.appendChild(precio);

    // Stock del Producto
    const stock = document.createElement("p");
    stock.id = `stock-${producto.id}`;
    stock.className = "producto-stock";
    stock.textContent = `Stock: ${producto.stock}`;
    infoContainer.appendChild(stock);

    // Botón de Acción
    const btnAgregar = document.createElement("button");
    btnAgregar.className = "producto-boton";
    btnAgregar.setAttribute("data-id", producto.id);
    if (producto.stock <= 0) {
      btnAgregar.textContent = "Sin Stock";
      btnAgregar.disabled = true;
    } else {
      btnAgregar.textContent = "Agregar al carrito";
      btnAgregar.disabled = false;
    }
    infoContainer.appendChild(btnAgregar);

    // Añadir el contenedor de información a la tarjeta
    card.appendChild(infoContainer);

    // Añadir la tarjeta completa al grid
    productosGrid.appendChild(card);
  });

  // Agregar event listeners a los botones de los productos
  document.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", function () {
      const productoId = parseInt(button.dataset.id);
      agregarProducto(productoId);

      if (button.textContent !== "Sin Stock") {
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

// ===== FUNCIONES DE FILTRADO =====

// Función para manejar el filtrado
function manejarFiltros() {
  const filtroNombre = document.getElementById("filtro-texto").value;
  const precioMaximo =
    parseFloat(document.getElementById("filto-numero").value) || Infinity;

  let productosFiltrados;
  if (filtroNombre && precioMaximo !== Infinity) {
    productosFiltrados = aplicarFiltros(filtroNombre, precioMaximo);
  } else if (filtroNombre) {
    productosFiltrados = filtrarPorNombre(filtroNombre);
  } else if (precioMaximo !== Infinity) {
    productosFiltrados = filtrarPorPrecio(precioMaximo);
  } else {
    productosFiltrados = productos;
  }

  actualizarProductosFiltrados(productosFiltrados);
}

// ===== FUNCIONES DE COMPRA =====

// Función para finalizar la compra
async function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    Swal.fire({
      title: "Carrito Vacío",
      text: "No hay productos en el carrito.",
      icon: "warning",
      confirmButtonText: "Ok",
    });
    return;
  }

  // Calcular el total de la compra
  const total = carrito.reduce((sum, item) => {
    return sum + item.precio * item.cantidad;
  }, 0);

  // Mostrar confirmación antes de finalizar
  const result = await Swal.fire({
    title: "¿Desea confirmar la compra?",
    text: `El total de tu compra es: $${total}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#2ecc71",
    cancelButtonColor: "#3498db",
    confirmButtonText: "Sí, finalizar compra",
    cancelButtonText: "Seguir comprando",
  });

  // Si el usuario confirma, finalizar la compra
  if (result.isConfirmed) {
    // Primero limpiamos el carrito y esperamos a que termine
    await limpiarCarrito(false, false);

    // Actualizamos la visualización de los productos
    mostrarProductos(productos);

    // Limpio los filtros
    limpiarFiltros();

    // Mostramos el mensaje de éxito
    await Swal.fire({
      title: "¡Compra Exitosa!",
      text: `Total pagado: $${total}. ¡Gracias por tu compra!`,
      icon: "success",
      confirmButtonText: "Ok",
    });
  }
}

// ===== INICIALIZACIÓN DE EVENT LISTENERS =====

// Event listeners para los filtros
document
  .getElementById("filtro-texto")
  .addEventListener("input", manejarFiltros);
document
  .getElementById("filto-numero")
  .addEventListener("input", manejarFiltros);

// Event listener para el botón de limpiar filtros
document
  .getElementById("limpiar-filtros")
  .addEventListener("click", limpiarFiltros);

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

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====

// Inicializar la aplicación
cargarProductos();

export { productos };
