const contenedor = document.getElementById("productos");
const carritoHTML = document.getElementById("carrito");
const totalHTML = document.getElementById("total");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnLimpiar = document.getElementById("btn-limpiar");

let carrito = []; //Declaramos un carrito para agregar los productos.
let total = 0; // Declaramos una variable total para guardar el total.

function calcularTotal() {
  total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0); // muestra la suma TOTAL de los productos agregados al carrito.
  totalHTML.textContent = total; // Actualiza el total en el HTML.
};

function guardarVentas(venta) { // Función para guardar las ventas en el localStorage. Recibe una venta como parámetro, que es un objeto con el pedido, el total y la fecha.
  const ventas = JSON.parse(localStorage.getItem("ventas")) || []; // Obtiene las ventas existentes. Si no hay, inicializa un array vacío.
  ventas.push(venta); // Agrega la nueva venta al array de ventas.
  localStorage.setItem("ventas", JSON.stringify(ventas)); // Guarda el array actualizado de ventas en el localStorage.
};

function renderCarrito() { // Función para renderizar el carrito en el HTML.
  carritoHTML.innerHTML = ""; // Limpia el carrito dejandolo vacio.
  if (carrito.length === 0) { // Si el carrito está vacío, muestra un mensaje.
    const li = document.createElement("li"); // Crea un elemento li para mostrar el mensaje del carrito vacío.
    li.textContent = "El carrito está vacío"; // le asignamos el mensaje al elemento li.
    li.style.color = "#555"; // le damos un estilo al mensaje.
    carritoHTML.appendChild(li); // Agregamos el li al carritoHTML.
    calcularTotal(); // Calculamos el total para mostrarlo como 0.
    return; 
  }

  carrito.forEach(item => { // Iteramos con un FOREACH sobre cada item del carrito para mostrarlo en el HTML.
    const li = document.createElement("li"); // Creamos un elemento li para cada item del carrito.
    li.innerHTML = `${item.nombre} x${item.cantidad} <strong>$${item.precio * item.cantidad}</strong>`; // Asignamos el nombre del producto, la cantidad y el precio total de ese producto al elemento li en negrita.

    const btnEliminar = document.createElement("button"); // Creamos un botón para eliminar el producto del carrito.
    btnEliminar.textContent = "Eliminar"; // Asignamos el texto "Eliminar" al botón.
    btnEliminar.onclick = () => { // Asignamos una función al evento onclick del botón para eliminar el producto del carrito.
      carrito = carrito.filter(producto => producto.id !== item.id); // asignamos al carrito un nuevo array, Solo deja los productos que NO coinciden con el id del item a eliminar
    };

    li.appendChild(btnEliminar); // Agregamos el botón de eliminar al elemento li.
    carritoHTML.appendChild(li); // Agregamos el elemento li al carritoHTML para mostrarlo en el HTML.
  });

  calcularTotal(); // Renderizamos el carrito para actualizar el total en el HTML.
}

function agregarAlCarrito(producto) { // Función para agregar un producto al carrito. Recibe el producto como parámetro.
  const existente = carrito.find(item => item.id === producto.id); // Buscamos si el producto ya existe en el carrito. Si existe, lo asignamos a la variable existente.
  if (existente) { // si el producto ya existe en el carrito, aumentamos su cantidad en 1.
    existente.cantidad += 1; // aumentamos la cantidad del producto existente en 1.
  } else { // Si el producto no existe en el carrito, lo agregamos con una cantidad inicial de 1.
    carrito.push({ ...producto, cantidad: 1 }); 
  }
  renderCarrito();
}

function renderProductos() { // Función para renderizar los productos en el HTML.
  const categorias = [...new Set(productos.map(p => p.categoria))]; // Obtenemos las categorías únicas de los productos. Creamos un Set a partir de un array que mapea los productos para obtener solo las categorías, y luego lo convertimos de nuevo a un array con el operador spread. 

  categorias.forEach(categoria => { // Iteramos sobre cada categoría para crear una sección en el HTML para cada una.
    const categoriaDiv = document.createElement("div"); // Creamos un div para cada categoría.
    categoriaDiv.classList.add("categoria"); // Le agregamos la clase "categoria" al div para darle estilo.

    const titulo = document.createElement("h3"); // Creamos un elemento h3 para mostrar el nombre de la categoría.
    titulo.textContent = categoria; // Asignamos el nombre de la categoría al elemento h3.
    categoriaDiv.appendChild(titulo); // Agregamos el título de la categoría al div de la categoría.

    productos // 
      .filter(prod => prod.categoria === categoria) // Filtramos los productos para mostrar solo los que pertenecen a la categoría actual.
      .forEach(prod => { // Iteramos sobre cada producto de la categoría para crear un elemento en el HTML para cada uno.
        const div = document.createElement("div"); // Creamos un div para cada producto.
        div.classList.add("producto"); // Le agregamos la clase "producto" al div para darle estilo.
        div.innerHTML = `<strong>${prod.nombre}</strong><span>$${prod.precio}</span>`; // Asignamos el nombre y el precio del producto al div.
        div.onclick = () => agregarAlCarrito(prod); // Asignamos una función al evento onclick del div para agregar el producto al carrito.
        categoriaDiv.appendChild(div); // Agregamos el div del producto al div de la categoría.
      });

    contenedor.appendChild(categoriaDiv); // Agregamos el div de la categoría al contenedor principal para mostrarlo en el HTML.
  });
}

function limpiarCarrito() { // funcion para limpiar el carrito. 
  carrito = []; // Vacia el array del carrito y renderiza el carrito para mostrarlo vacío en el HTML.
  renderCarrito(); // Renderiza el carrito para mostrarlo vacío en el HTML.
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