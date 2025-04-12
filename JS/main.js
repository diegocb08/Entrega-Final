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
      const response = await fetch(
        "https://diegocb08.github.io/webcoder/productos.json"
      );
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      productos = data;
      localStorage.setItem("productos", JSON.stringify(data));
    }

    // Una vez cargados los productos, generar las tarjetas
    generarTarjetasProductos();
    actualizarCarritoDom();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Función para generar las tarjetas de productos
function generarTarjetasProductos() {
  const productosGrid = document.getElementById("productos-grid");

  productosGrid.innerHTML = ""; // Limpiar contenido existente

  productos.forEach((producto) => {
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
    stock.id = `stock-${producto.nombre.toLowerCase()}`;
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

  limpiarCarrito(false); // Limpio el carrito sin mostrar el mensaje de "Carrito Vacio"

  Swal.fire({
    title: "¡Compra Finalizada!",
    text: `Total: $${total}. Gracias por su compra.`,
    icon: "success",
    confirmButtonText: "Ok",
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
