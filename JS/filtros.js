import { productos } from "./main.js";

// ===== FUNCIONES DE FILTRADO =====

// Función para filtrar por nombre
export function filtrarPorNombre(filtroUsuario) {
  return productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(filtroUsuario.toLowerCase())
  );
}

// Función para filtrar por precio
export function filtrarPorPrecio(precioMaximo) {
  return productos.filter((producto) => producto.precio <= precioMaximo);
}

// Función para combinar filtros
export function aplicarFiltros(filtroNombre, precioMaximo) {
  return productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      producto.precio <= precioMaximo
  );
}

// ===== FUNCIONES DE UI =====

// Función para actualizar el DOM con los productos filtrados
export function actualizarProductosFiltrados(productosFiltrados) {
  const productosGrid = document.getElementById("productos-grid");
  productosGrid.innerHTML = ""; // Limpiar el grid

  productosFiltrados.forEach((producto) => {
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

  // Agregar event listeners a los botones de los productos filtrados
  document.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", function () {
      const productoId = parseInt(button.dataset.id);
      import("./carrito.js").then((module) => {
        module.agregarProducto(productoId);
      });
    });
  });
}

// ===== FUNCIONES DE UTILIDAD =====

// Función para limpiar los filtros
export function limpiarFiltros() {
  // Limpiar los inputs
  document.getElementById("filtro-texto").value = "";
  document.getElementById("filto-numero").value = "";

  // Mostrar todos los productos
  actualizarProductosFiltrados(productos);
}
