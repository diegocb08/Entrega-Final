import {
  agregarProducto,
  actualizarCarritoDom,
  limpiarCarrito,
} from "./carrito.js";

// Listado de productos
let productos = JSON.parse(localStorage.getItem("productos")) || [
  {
    nombre: "Agua",
    precio: 1000,
    stock: 5,
    id: 1,
  },
  {
    nombre: "Alfajor",
    precio: 1500,
    stock: 2,
    id: 2,
  },
  {
    nombre: "Gaseosa",
    precio: 1200,
    stock: 4,
    id: 3,
  },
  {
    nombre: "Vino",
    precio: 5000,
    stock: 0,
    id: 4,
  },
  {
    nombre: "Café",
    precio: 2000,
    stock: 3,
    id: 5,
  },
];

// Función para generar la tabla de productos desde el array
function generarTablaProductos() {
  const productosBody = document.getElementById("productos-body");
  if (!productosBody) {
    console.error("No se encontró el elemento con ID 'productos-body'");
    return;
  }

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
    alert("No hay productos en el carrito");
    return;
  }

  // Calcular el total de la compra
  const total = carrito.reduce((sum, item) => {
    return sum + item.precio * item.cantidad;
  }, 0);

  localStorage.setItem("carrito", JSON.stringify([]));

  actualizarCarritoDom();

  alert(`Compra finalizada, Total: $${total}\nGracias por su compra.`);
}

// Inicializar la aplicación
generarTablaProductos();
actualizarCarritoDom();

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
