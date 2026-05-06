import { onComandasSnapshot, onProductosSnapshot, addProducto, updateProducto, deleteProducto } from "./firebase-service.js"; // Importa las funciones necesarias del servicio de Firebase para interactuar con la base de datos, como escuchar cambios en tiempo real en las colecciones de comandas y productos, agregar, actualizar y eliminar productos desde la interfaz de administración.
const ventasList = document.getElementById("ventas");
const totalDiaHTML = document.getElementById("totalDia");
const btnLimpiarVentas = document.getElementById("btn-limpiar-ventas");
const fechaFiltro = document.getElementById("fecha-filtro");
const productoForm = document.getElementById("producto-form");
const productoNombre = document.getElementById("producto-nombre");
const productoPrecio = document.getElementById("producto-precio");
const productoCategoria = document.getElementById("producto-categoria");
const productoAccion = document.getElementById("producto-accion");
const productoIdInput = document.getElementById("producto-id");
const productosAdminList = document.getElementById("productos-admin");
const adminWarning = document.getElementById("admin-warning");

let productosSnapshotUnsub = null; // Variable para almacenar la función de cancelación de la escucha de productos, lo que permite detener la escucha cuando el administrador cambia de rol o cierra sesión.

function formatDate(timestamp) { // Formatear un timestamp de Firebase a una cadena legible para mostrar la fecha y hora de las ventas en la interfaz de administración.
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}

function renderVentas(comandas) { // Renderizar la lista de ventas en la interfaz de administración, mostrando la fecha y el total de cada comanda finalizada, y calculando el total del día para las ventas mostradas.
  ventasList.innerHTML = "";
  let totalDia = 0;

  const vendidos = comandas.filter(comanda => comanda.estado === "Finalizado"); // Filtrar las comandas para mostrar solo las que tienen el estado "Finalizado", lo que indica que son ventas que se han completado y deben ser mostradas en la lista de ventas del día.

  if (vendidos.length === 0) { // Si no hay ventas finalizadas para la fecha seleccionada, mostrar un mensaje indicando que no hay ventas para esa fecha en lugar de una lista vacía.
    const li = document.createElement("li");
    li.textContent = "No hay ventas finalizadas para la fecha seleccionada.";
    li.style.color = "#555";
    ventasList.appendChild(li);
  }

  vendidos.forEach(comanda => { // Iterar sobre las comandas finalizadas y crear un elemento de lista para cada una, mostrando la fecha formateada y el total de la venta. También acumular el total del día sumando el total de cada comanda finalizada para mostrarlo al final de la lista.
    const li = document.createElement("li");
    li.innerHTML = `<span>${formatDate(comanda.fecha)}</span><strong>$${comanda.total}</strong>`;
    ventasList.appendChild(li);
    totalDia += comanda.total;
  });

  totalDiaHTML.textContent = totalDia; // Actualizar el elemento HTML que muestra el total del día con el valor calculado a partir de las ventas finalizadas mostradas en la lista.
}

function renderProductosAdmin(productos) { // Renderizar la lista de productos en la interfaz de administración, mostrando el nombre, precio y categoría de cada producto, y agregando botones para editar y eliminar cada producto. Si no hay productos cargados, mostrar un mensaje indicando que no hay productos disponibles.
  productosAdminList.innerHTML = "";
  if (productos.length === 0) { // si no hay productos cargados en la base de datos, mostrar un mensaje indicando que no hay productos disponibles en lugar de una lista vacía, para informar al administrador que debe agregar productos antes de poder editarlos o eliminarlos.
    const li = document.createElement("li");
    li.textContent = "No hay productos cargados.";
    li.style.color = "#555";
    productosAdminList.appendChild(li);
    return; // Detener la ejecución de la función para evitar intentar renderizar productos cuando no hay ninguno disponible, lo que previene errores y muestra claramente al administrador que debe agregar productos antes de poder editarlos o eliminarlos.
  }

  productos.forEach(producto => { // Iterar sobre los productos y crear un elemento de lista para cada uno, mostrando el nombre, precio y categoría del producto. Agregar botones para editar y eliminar cada producto, con funcionalidades para cargar los datos del producto en el formulario de edición o eliminar el producto de la base de datos respectivamente.
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>${producto.nombre}</strong> <span>$${producto.precio}</span><small>${producto.categoria}</small></div>`;

    const botonEditar = document.createElement("button"); // Crear un botón de "Editar" para cada producto, que al hacer clic carga los datos del producto en el formulario de edición para que el administrador pueda modificarlo fácilmente. El botón también cambia el texto del formulario para indicar que se está actualizando un producto existente en lugar de agregando uno nuevo.
    botonEditar.textContent = "Editar";
    botonEditar.classList.add("btn-small");
    botonEditar.onclick = () => {
      productoIdInput.value = producto.id;
      productoNombre.value = producto.nombre;
      productoPrecio.value = producto.precio;
      productoCategoria.value = producto.categoria;
      productoAccion.textContent = "Actualizar producto";
    };

    const botonEliminar = document.createElement("button"); // Crear un botón de "Eliminar" para cada producto, que al hacer clic muestra una confirmación para eliminar el producto. Si el administrador confirma, se elimina el producto de la base de datos utilizando la función deleteProducto, lo que permite mantener la base de datos actualizada y evitar eliminar productos por error.
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("btn-small btn-danger");
    botonEliminar.onclick = () => {
      if (confirm(`Eliminar ${producto.nombre}?`)) {
        deleteProducto(producto.id);
      }
    };

    li.appendChild(botonEditar);
    li.appendChild(botonEliminar);
    productosAdminList.appendChild(li); // Agregar el elemento de lista con el producto y sus botones de edición y eliminación a la lista de productos en la interfaz de administración, lo que permite al administrador ver y gestionar fácilmente los productos disponibles en la base de datos.
  });
}

function filterComandasByDate(comandas, filterDate) { // Filtrar las comandas por una fecha específica, comparando la fecha de cada comanda con la fecha proporcionada en el filtro. Si no se proporciona una fecha de filtro, se devuelve la lista completa de comandas sin filtrar. Esta función permite al administrador ver solo las comandas que corresponden a una fecha específica, lo que facilita la gestión y revisión de las ventas por día.
  if (!filterDate) return comandas;
  const target = new Date(filterDate + "T23:59:59");
  return comandas.filter(comanda => {
    const fecha = comanda.fecha.toDate ? comanda.fecha.toDate() : new Date(comanda.fecha);
    return fecha.toDateString() === target.toDateString();
  });
}

function wireAdminListeners(role) { // Configurar los listeners y funcionalidades de la interfaz de administración según el rol del usuario. Si el rol no es "Dueño", se muestra una advertencia y se oculta el formulario de gestión de productos, pero aún se permite ver las ventas. Si el rol es "Dueño", se configuran listeners para mostrar los productos en tiempo real y permitir agregar, editar y eliminar productos desde la interfaz de administración.
  if (role !== "Dueño") {
    adminWarning.textContent = "Solo el dueño puede editar productos, pero podés ver las ventas desde aquí.";
    productoForm.classList.add("hidden");
  }

  let comandasCache = [];
  productosSnapshotUnsub = onComandasSnapshot(snapshot => {
    comandasCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtradas = filterComandasByDate(comandasCache, fechaFiltro.value);
    renderVentas(filtradas);
  });

  fechaFiltro.addEventListener("change", () => { // Agregar un listener al cambio del filtro de fecha, que al cambiar la fecha de filtro vuelve a filtrar las comandas almacenadas en caché por la nueva fecha seleccionada y vuelve a renderizar la lista de ventas con las comandas filtradas, lo que permite al administrador ver las ventas correspondientes a la fecha seleccionada sin necesidad de volver a cargar los datos desde la base de datos.
    const filtradas = filterComandasByDate(comandasCache, fechaFiltro.value);
    renderVentas(filtradas);
  });

  if (role === "Dueño") {
    onProductosSnapshot(snapshot => {
      const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderProductosAdmin(productos);
    });
  }

  btnLimpiarVentas.addEventListener("click", () => {
    if (confirm("¿Querés borrar historiales? Esta acción solo limpia la vista local, no la base de datos.")) {
      fechaFiltro.value = "";
      if (typeof onRoleReady === "function") {
        onRoleReady(role);
      }
    }
  });

  productoForm.addEventListener("submit", event => { // Agregar un listener al formulario de productos para manejar la creación y actualización de productos. Al enviar el formulario, se verifica si se está editando un producto existente (si hay un ID presente) o si se está creando uno nuevo. Se llama a la función correspondiente para agregar o actualizar el producto en la base de datos, y luego se limpia el formulario y se restablece el estado del formulario para agregar un nuevo producto.
    event.preventDefault();
    if (role !== "Dueño") return;

    const id = productoIdInput.value.trim(); // Obtener el ID del producto del campo oculto en el formulario, lo que permite determinar si se está editando un producto existente (si hay un ID presente) o si se está creando uno nuevo (si el campo de ID está vacío). Esto es esencial para decidir si se debe llamar a la función de actualización o a la función de creación al enviar el formulario.
    const data = {
      nombre: productoNombre.value.trim(),
      precio: Number(productoPrecio.value),
      categoria: productoCategoria.value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!data.nombre || !data.precio || !data.categoria) return;

    if (id) {
      updateProducto(id, data).then(() => {
        productoForm.reset();
        productoIdInput.value = "";
        productoAccion.textContent = "Agregar producto";
      });
    } else {
      addProducto({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => {
        productoForm.reset();
      });
    }
  });
}

function initAdmin() { // Función de inicialización para configurar la interfaz de administración. Se asigna la función wireAdminListeners a window.onRoleReady para que se ejecute cuando el rol del usuario esté disponible. Si el rol del usuario ya está disponible en window.pendingAuth, se llama a onRoleReady inmediatamente con el rol almacenado, lo que permite configurar la interfaz de administración según el rol del usuario tan pronto como se cargue la página. Si el rol no está disponible, se espera a que se establezca y se llame a onRoleReady cuando eso suceda, lo que garantiza que la interfaz de administración se configure correctamente según el rol del usuario una vez que se haya determinado su rol después de iniciar sesión.
  window.onRoleReady = wireAdminListeners;

  if (window.pendingAuth) {
    onRoleReady(window.pendingAuth.role);
    window.pendingAuth = null;
  }
}

initAdmin();
