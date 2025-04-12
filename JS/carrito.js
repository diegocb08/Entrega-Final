import { productos } from "./main.js";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para agregar productos al carrito
function agregarProducto(productoId) {
  const producto = productos.find((p) => p.id === productoId);
  if (producto && producto.stock > 0) {
    producto.stock--;

    const productoEnCarrito = carrito.find((item) => item.id === productoId);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad++;
    } else {
      // Se agrega una copia del producto con la propiedad 'cantidad'
      carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarritoDom();

    // Actualizo el botón según el stock disponible
    const btnAgregar = document.querySelector(
      `button[data-id="${productoId}"]`
    );
    if (btnAgregar && producto.stock <= 0) {
      btnAgregar.disabled = true;
      btnAgregar.textContent = "Sin Stock";
    }

    // También actualiza la visualización del stock en la tabla de productos
    const stockSelector = `#stock-${producto.nombre.toLowerCase()}`;
    const stockElement = document.querySelector(stockSelector);
    if (stockElement) {
      stockElement.textContent = producto.stock;
    }
  }
}

// Función para actualizar el carrito en el DOM
function actualizarCarritoDom() {
  const carritoTabla = document.querySelector("#carrito-tabla tbody");

  // Limpia la tabla excepto la cabecera
  carritoTabla.innerHTML = "";

  carrito.forEach((producto) => {
    const nuevaFila = document.createElement("tr");

    // Columna: Nombre
    const nombreCelda = document.createElement("td");
    nombreCelda.textContent = producto.nombre;
    nuevaFila.appendChild(nombreCelda);

    // Columna: Precio
    const precioCelda = document.createElement("td");
    precioCelda.innerHTML = `$${producto.precio}`;
    nuevaFila.appendChild(precioCelda);

    // Columna: Cantidad
    const cantidadCelda = document.createElement("td");
    cantidadCelda.textContent = producto.cantidad;
    nuevaFila.appendChild(cantidadCelda);

    // Columna: Botón para quitar productos
    const accionCelda = document.createElement("td");
    const btnQuitar = document.createElement("button");
    btnQuitar.textContent = "Quitar";

    btnQuitar.addEventListener("click", function () {
      quitarProducto(producto.id);
    });
    accionCelda.appendChild(btnQuitar);
    nuevaFila.appendChild(accionCelda);

    carritoTabla.appendChild(nuevaFila);
  });

  // Agregar fila para el total del carrito
  if (carrito.length > 0) {
    const filaTotal = document.createElement("tr");

    const celdaTotalTexto = document.createElement("td");
    celdaTotalTexto.textContent = "Total:";
    filaTotal.appendChild(celdaTotalTexto);

    const celdaTotalValor = document.createElement("td");
    celdaTotalValor.setAttribute("colspan", "3");
    celdaTotalValor.innerHTML = `$${calcularTotalCarrito()}`;
    filaTotal.appendChild(celdaTotalValor);

    carritoTabla.appendChild(filaTotal);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("productos", JSON.stringify(productos));
}

// Función para quitar un producto del carrito
function quitarProducto(productoId) {
  const productoEnCarrito = carrito.find((item) => item.id === productoId);
  if (productoEnCarrito) {
    productoEnCarrito.cantidad--;

    // Actualizar el stock en el listado (array productos)
    const producto = productos.find((p) => p.id === productoId);
    if (producto) {
      producto.stock++;

      // Habilitar el botón si estaba deshabilitado
      const btnAgregar = document.querySelector(
        `button[data-id="${productoId}"]`
      );
      if (btnAgregar && producto.stock > 0) {
        btnAgregar.disabled = false;
        btnAgregar.textContent = "Agregar al carrito";
      }

      // Actualizar el stock mostrado
      const stockSelector = `#stock-${producto.nombre.toLowerCase()}`;
      const stockElement = document.querySelector(stockSelector);
      if (stockElement) {
        stockElement.textContent = producto.stock;
      }
    }

    // Si la cantidad se reduce a 0, se elimina del carrito
    if (productoEnCarrito.cantidad === 0) {
      carrito = carrito.filter((item) => item.id !== productoId);
    }

    actualizarCarritoDom();
  }
}

// Función que calcula el total del carrito
function calcularTotalCarrito() {
  return carrito.reduce((total, producto) => {
    return total + producto.precio * producto.cantidad;
  }, 0);
}

// Función para limpiar el carrito
function limpiarCarrito() {
  carrito.forEach((item) => {
    const producto = productos.find((p) => p.id === item.id);
    if (producto) {
      producto.stock += item.cantidad;

      // Actualizar el stock mostrado
      const stockSelector = `#stock-${producto.nombre.toLowerCase()}`;
      const stockElement = document.querySelector(stockSelector);
      if (stockElement) {
        stockElement.textContent = producto.stock;
      }

      // Actualizar botón
      const btnAgregar = document.querySelector(
        `button[data-id="${producto.id}"]`
      );
      if (btnAgregar) {
        btnAgregar.disabled = false;
        btnAgregar.textContent = "Agregar al carrito";
      }
    }
  });

  // Vaciar el carrito
  carrito = [];

  // Actualizar DOM
  actualizarCarritoDom();

  // Guardar en localStorage
  localStorage.setItem("carrito", JSON.stringify([]));
  localStorage.setItem("productos", JSON.stringify(productos));

  Swal.fire({
    title: '¡Listo!',
    text: 'El carrito ha sido limpiado',
    icon: 'success',
    confirmButtonText: 'Ok'
  });
}

export {
  agregarProducto,
  actualizarCarritoDom,
  quitarProducto,
  limpiarCarrito,
};
