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

let productosSnapshotUnsub = null;

function formatDate(timestamp) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}

function renderVentas(comandas) {
  ventasList.innerHTML = "";
  let totalDia = 0;

  const vendidos = comandas.filter(comanda => comanda.estado === "Finalizado");

  if (vendidos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay ventas finalizadas para la fecha seleccionada.";
    li.style.color = "#555";
    ventasList.appendChild(li);
  }

  vendidos.forEach(comanda => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${formatDate(comanda.fecha)}</span><strong>$${comanda.total}</strong>`;
    ventasList.appendChild(li);
    totalDia += comanda.total;
  });

  totalDiaHTML.textContent = totalDia;
}

function renderProductosAdmin(productos) {
  productosAdminList.innerHTML = "";
  if (productos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay productos cargados.";
    li.style.color = "#555";
    productosAdminList.appendChild(li);
    return;
  }

  productos.forEach(producto => {
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>${producto.nombre}</strong> <span>$${producto.precio}</span><small>${producto.categoria}</small></div>`;

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.classList.add("btn-small");
    botonEditar.onclick = () => {
      productoIdInput.value = producto.id;
      productoNombre.value = producto.nombre;
      productoPrecio.value = producto.precio;
      productoCategoria.value = producto.categoria;
      productoAccion.textContent = "Actualizar producto";
    };

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("btn-small btn-danger");
    botonEliminar.onclick = () => {
      if (confirm(`Eliminar ${producto.nombre}?`)) {
        deleteProducto(producto.id);
      }
    };

    li.appendChild(botonEditar);
    li.appendChild(botonEliminar);
    productosAdminList.appendChild(li);
  });
}

function filterComandasByDate(comandas, filterDate) {
  if (!filterDate) return comandas;
  const target = new Date(filterDate + "T23:59:59");
  return comandas.filter(comanda => {
    const fecha = comanda.fecha.toDate ? comanda.fecha.toDate() : new Date(comanda.fecha);
    return fecha.toDateString() === target.toDateString();
  });
}

function wireAdminListeners(role) {
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

  fechaFiltro.addEventListener("change", () => {
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

  productoForm.addEventListener("submit", event => {
    event.preventDefault();
    if (role !== "Dueño") return;

    const id = productoIdInput.value.trim();
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

function initAdmin() {
  window.onRoleReady = wireAdminListeners;

  if (window.pendingAuth) {
    onRoleReady(window.pendingAuth.role);
    window.pendingAuth = null;
  }
}

initAdmin();
