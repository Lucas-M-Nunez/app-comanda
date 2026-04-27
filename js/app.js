const contenedor = document.getElementById("productos");
const carritoHTML = document.getElementById("carrito");
const totalHTML = document.getElementById("total");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnLimpiar = document.getElementById("btn-limpiar");

let carrito = [];
let total = 0;

function calcularTotal() {
  total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  totalHTML.textContent = total;
}

function guardarVentas(venta) {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.push(venta);
  localStorage.setItem("ventas", JSON.stringify(ventas));
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
    li.innerHTML = `${item.nombre} x${item.cantidad} <strong>$${item.precio * item.cantidad}</strong>`;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => {
      carrito = carrito.filter(producto => producto.id !== item.id);
      renderCarrito();
    };

    li.appendChild(btnEliminar);
    carritoHTML.appendChild(li);
  });

  calcularTotal();
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

function renderProductos() {
  const categorias = [...new Set(productos.map(p => p.categoria))];

  categorias.forEach(categoria => {
    const categoriaDiv = document.createElement("div");
    categoriaDiv.classList.add("categoria");

    const titulo = document.createElement("h3");
    titulo.textContent = categoria;
    categoriaDiv.appendChild(titulo);

    productos
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

function limpiarCarrito() {
  carrito = [];
  renderCarrito();
}

function finalizarPedido() {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agregá productos antes de finalizar.");
    return;
  }

  guardarVentas({
    pedido: carrito,
    total,
    fecha: new Date().toLocaleString()
  });

  alert("Pedido registrado correctamente");
  limpiarCarrito();
}

btnFinalizar.addEventListener("click", finalizarPedido);
btnLimpiar.addEventListener("click", limpiarCarrito);

renderProductos();
renderCarrito();
