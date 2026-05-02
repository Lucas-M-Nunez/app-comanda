const contenedor = document.getElementById("productos");
const carritoHTML = document.getElementById("carrito");
const totalHTML = document.getElementById("total");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnLimpiar = document.getElementById("btn-limpiar");
const detalleInput = document.getElementById("detalle");
const ordenesPanel = document.getElementById("ordenes-panel");
const comandasContainer = document.getElementById("comandas");

let carrito = [];
let total = 0;
let productosUnsub = null;
let comandasUnsub = null;

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}

function calcularTotal() {
  total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  totalHTML.textContent = total;
}

function renderCarrito() {
  carritoHTML.innerHTML = "";

  if (carrito.length === 0) {
    const li = document.createElement("li");
    li.textContent = "El carrito está vacío";
    li.style.color = "#555";
    carritoHTML.appendChild(li);
    calcularTotal();
    return;
  }

  carrito.forEach(item => {
    const li = document.createElement("li");
    const details = document.createElement("div");
    details.innerHTML = `<strong>${item.nombre}</strong><span>Cantidad: ${item.cantidad}</span>`;
    li.appendChild(details);

    const actionWrapper = document.createElement("div");
    actionWrapper.style.display = "flex";
    actionWrapper.style.alignItems = "center";
    actionWrapper.style.gap = "8px";

    const itemTotal = document.createElement("span");
    itemTotal.textContent = `$${item.precio * item.cantidad}`;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => {
      carrito = carrito.filter(producto => producto.id !== item.id);
      renderCarrito();
    };

    actionWrapper.appendChild(itemTotal);
    actionWrapper.appendChild(btnEliminar);
    li.appendChild(actionWrapper);
    carritoHTML.appendChild(li);
  });

  calcularTotal();
}

function renderProductos(productosData) {
  contenedor.innerHTML = "";
  const categorias = [...new Set(productosData.map(p => p.categoria))];

  categorias.forEach(categoria => {
    const categoriaDiv = document.createElement("div");
    categoriaDiv.classList.add("categoria");

    const titulo = document.createElement("h3");
    titulo.textContent = categoria;
    categoriaDiv.appendChild(titulo);

    productosData
      .filter(prod => prod.categoria === categoria)
      .forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `<strong>${prod.nombre}</strong><span>$${prod.precio}</span>`;
        div.onclick = () => agregarAlCarrito(prod);
        categoriaDiv.appendChild(div);
      });

    contenedor.appendChild(categoriaDiv);
  });
}

function renderComandas(comandas) {
  comandasContainer.innerHTML = "";

  if (comandas.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No hay comandas activas.";
    empty.style.color = "#555";
    comandasContainer.appendChild(empty);
    return;
  }

  comandas.forEach(comanda => {
    const card = document.createElement("div");
    card.classList.add("orden-card");

    const header = document.createElement("header");
    header.innerHTML = `<strong>#${comanda.id}</strong><small>${formatDate(comanda.fecha)}</small>`;
    card.appendChild(header);

    const detail = document.createElement("p");
    detail.textContent = comanda.detalle || "Sin detalle adicional";
    card.appendChild(detail);

    const itemList = document.createElement("ul");
    itemList.className = "carrito-list";
    comanda.items.forEach(producto => {
      const item = document.createElement("li");
      item.innerHTML = `<div><strong>${producto.nombre}</strong><span>Cantidad: ${producto.cantidad}</span></div><span>$${producto.precio * producto.cantidad}</span>`;
      itemList.appendChild(item);
    });
    card.appendChild(itemList);

    const estado = document.createElement("div");
    estado.classList.add("estado");
    estado.innerHTML = `<span>Estado:</span><strong>${comanda.estado}</strong>`;
    card.appendChild(estado);

    if (window.currentRole === "Barista" || window.currentRole === "Dueño") {
      const next = getNextStatus(comanda.estado);
      if (next) {
        const btn = document.createElement("button");
        btn.classList.add("btn", "btn-secondary", "btn-small");
        btn.textContent = `Marcar ${next}`;
        btn.onclick = () => updateComandaStatus(comanda.id, next);
        estado.appendChild(btn);
      }
    }

    const footer = document.createElement("div");
    footer.classList.add("resumen");
    footer.innerHTML = `<span>Total pedido</span><strong>$${comanda.total}</strong>`;
    card.appendChild(footer);

    comandasContainer.appendChild(card);
  });
}

function getNextStatus(current) {
  if (current === "Pendiente") return "En proceso";
  if (current === "En proceso") return "Finalizado";
  return null;
}

function agregarAlCarrito(producto) {
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  renderCarrito();
}

function limpiarCarrito() {
  carrito = [];
  detalleInput.value = "";
  renderCarrito();
}

function finalizarPedido() {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agregá productos antes de finalizar.");
    return;
  }

  if (!window.currentUser || !window.currentRole) {
    alert("Debés iniciar sesión para generar la comanda.");
    return;
  }

  const comandaData = {
    items: carrito,
    total,
    detalle: detalleInput.value.trim(),
    estado: "Pendiente",
    fecha: firebase.firestore.Timestamp.fromDate(new Date()),
    creadoPor: {
      uid: window.currentUser.uid,
      email: window.currentUser.email,
      role: window.currentRole
    }
  };

  addComanda(comandaData)
    .then(() => {
      alert("Comanda generada correctamente.");
      limpiarCarrito();
    })
    .catch(error => {
      console.error(error);
      alert("Error al generar la comanda: " + error.message);
    });
}

function startListeners(role) {
  if (productosUnsub) productosUnsub();
  productosUnsub = onProductosSnapshot(snapshot => {
    const productosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProductos(productosData);
  });

  if (comandasUnsub) comandasUnsub();
  if (role === "Barista" || role === "Dueño") {
    ordenesPanel.classList.remove("hidden");
    comandasUnsub = onComandasSnapshot(snapshot => {
      const comandas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderComandas(comandas);
    });
  } else {
    ordenesPanel.classList.add("hidden");
  }
}

function handleRoleReady(role) {
  if (!role) return;

  if (role === "Cajero" || role === "Mozo" || role === "Dueño") {
    btnFinalizar.disabled = false;
    btnLimpiar.disabled = false;
    detalleInput.disabled = false;
  }

  if (role === "Barista") {
    btnFinalizar.disabled = true;
    btnLimpiar.disabled = true;
    detalleInput.disabled = true;
  }

  if (role === "Dueño") {
    btnFinalizar.disabled = false;
    btnLimpiar.disabled = false;
    detalleInput.disabled = false;
  }

  const seedData = typeof productos !== "undefined" ? productos : (window.productos || []);
  seedProductosIfEmpty(seedData).then(() => startListeners(role));
}

window.onRoleReady = handleRoleReady;
if (window.pendingAuth && typeof onRoleReady === "function") {
  onRoleReady(window.pendingAuth.role);
  window.pendingAuth = null;
}

btnFinalizar.addEventListener("click", finalizarPedido);
btnLimpiar.addEventListener("click", limpiarCarrito);
renderCarrito();
