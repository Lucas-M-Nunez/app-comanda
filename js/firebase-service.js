import { db } from "./firebase-config.js"; // Importa la instancia de Firestore desde el archivo de configuración de Firebase para interactuar con la base de datos.

import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  where,
  Timestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // Importa las funciones necesarias de Firebase Firestore para interactuar con la base de datos, como obtener documentos, agregar, actualizar, eliminar, escuchar cambios en tiempo real, realizar consultas y manejar transacciones en batch en la colección de productos y comandas.

// 🔹 USER
export function getUserProfile(uid) { // Obtener perfil de usuario por UID y devolver una promesa con el documento del usuario correspondiente al UID proporcionado.
  return getDoc(doc(db, "users", uid)); // Devuelve una promesa con el documento del usuario correspondiente al UID proporcionado
}

// 🔹 ESCUCHAR PERFIL
export function onUserProfile(uid, callback) { // Escuchar cambios en el perfil de usuario por UID y ejecutar un callback con el documento actualizado cada vez que cambie.
  return onSnapshot(doc(db, "users", uid), callback); // Devuelve una función para cancelar la escucha y llama al callback con el documento actualizado cada vez que cambia el perfil del usuario
}

// 🔹 PRODUCTOS
export function onProductosSnapshot(callback) { // Escuchar cambios en la colección de productos y ejecutar un callback con los documentos actualizados cada vez que cambien. 
  const q = query(collection(db, "productos"), orderBy("categoria")); // Crea una consulta para obtener los productos ordenados por categoría y devuelve una función para cancelar la escucha. Llama al callback con los documentos actualizados cada vez que cambien los productos.
  return onSnapshot(q, callback); // Devuelve una función para cancelar la escucha y llama al callback con los documentos actualizados cada vez que cambien los productos.
}

export function addProducto(data) { // Agregar un nuevo producto a la colección de productos con los datos proporcionados y devolver una promesa con el resultado de la operación.
  return addDoc(collection(db, "productos"), data);
}

export function updateProducto(id, data) { // Actualizar un producto existente en la colección de productos con los datos proporcionados y devolver una promesa con el resultado de la operación.
  return updateDoc(doc(db, "productos", id), data);
}

export function deleteProducto(id) { // Eliminar un producto de la colección de productos por su ID y devolver una promesa con el resultado de la operación.
  return deleteDoc(doc(db, "productos", id)); 
}

// 🔹 SEED PRODUCTOS
export async function seedProductosIfEmpty(localProducts) { // esta función verifica si la colección de productos está vacía y, si es así, agrega los productos locales proporcionados a la colección utilizando una operación de escritura en batch para optimizar la inserción. Devuelve una promesa con el resultado de la operación de inserción si la colección estaba vacía, o simplemente devuelve si ya había productos en la colección, lo que permite inicializar la base de datos con productos predeterminados solo si no hay productos existentes.
  const snapshot = await getDocs(collection(db, "productos"));
  if (!snapshot.empty) return;

  const batch = writeBatch(db); // Crea una operación de escritura en batch para optimizar la inserción de múltiples productos a la colección de productos si la colección estaba vacía. Itera sobre los productos locales proporcionados y agrega cada uno al batch para su inserción, y luego ejecuta el batch para agregar los productos a la colección de productos. Devuelve una promesa con el resultado de la operación de inserción si la colección estaba vacía, o simplemente devuelve si ya había productos en la colección, lo que permite inicializar la base de datos con productos predeterminados solo si no hay productos existentes.

  localProducts.forEach((producto) => { // Itera sobre los productos locales proporcionados y agrega cada uno a la colección de productos utilizando un batch para optimizar la operación. Devuelve una promesa con el resultado de la operación.
    const docRef = doc(collection(db, "productos")); 
    batch.set(docRef, {
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      createdAt: serverTimestamp(),
    });
  });

  return batch.commit(); // Devuelve una promesa que se resuelve cuando se completa la operación de escritura en batch, agregando los productos locales a la colección de productos si estaba vacía.
}

// 🔹 COMANDAS
export function onComandasSnapshot(callback) { // Escuchar cambios en la colección de comandas y ejecutar un callback con los documentos actualizados cada vez que cambien. Devuelve una función para cancelar la escucha y llama al callback con los documentos actualizados cada vez que cambien las comandas. 
  const q = query(collection(db, "comandas"), orderBy("fecha", "desc"));
  return onSnapshot(q, callback);
}

export function addComanda(data) { // Agregar una nueva comanda a la colección de comandas con los datos proporcionados y devolver una promesa con el resultado de la operación.
  return addDoc(collection(db, "comandas"), data);
}

export function updateComandaStatus(id, status) { // Actualizar el estado de una comanda existente en la colección de comandas y devolver una promesa con el resultado de la operación.
  return updateDoc(doc(db, "comandas", id), {
    estado: status,
    updatedAt: serverTimestamp(), // Agrega un campo de marca de tiempo para saber cuándo se actualizó el estado
  });
}

// 🔹 COMANDAS POR FECHA
export function getComandasByDate(dateString) { // Obtener comandas de la colección de comandas filtradas por una fecha específica y devolver una promesa con los documentos que coinciden con la fecha proporcionada.
  const start = new Date(dateString + "T00:00:00");
  const end = new Date(dateString + "T23:59:59");

  const q = query( // Crea una consulta para obtener las comandas que tienen una fecha dentro del rango del día especificado y devuelve una promesa con los documentos que coinciden con la fecha proporcionada.
    collection(db, "comandas"),
    where("fecha", ">=", Timestamp.fromDate(start)),
    where("fecha", "<=", Timestamp.fromDate(end)),
    orderBy("fecha", "desc"),
  );

  return getDocs(q); // Devuelve una promesa con los documentos que coinciden con la fecha proporcionada y que están ordenados por fecha en orden descendente.
}
