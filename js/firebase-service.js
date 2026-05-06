import { db } from "./firebase-config.js";

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
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 🔹 USER
export function getUserProfile(uid) {
  return getDoc(doc(db, "users", uid));
}

// 🔹 ESCUCHAR PERFIL
export function onUserProfile(uid, callback) {
  return onSnapshot(doc(db, "users", uid), callback);
}

// 🔹 PRODUCTOS
export function onProductosSnapshot(callback) {
  const q = query(collection(db, "productos"), orderBy("categoria"));
  return onSnapshot(q, callback);
}

export function addProducto(data) {
  return addDoc(collection(db, "productos"), data);
}

export function updateProducto(id, data) {
  return updateDoc(doc(db, "productos", id), data);
}

export function deleteProducto(id) {
  return deleteDoc(doc(db, "productos", id));
}

// 🔹 SEED PRODUCTOS
export async function seedProductosIfEmpty(localProducts) {
  const snapshot = await getDocs(collection(db, "productos"));
  if (!snapshot.empty) return;

  const batch = writeBatch(db);

  localProducts.forEach((producto) => {
    const docRef = doc(collection(db, "productos"));
    batch.set(docRef, {
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      createdAt: serverTimestamp(),
    });
  });

  return batch.commit();
}

// 🔹 COMANDAS
export function onComandasSnapshot(callback) {
  const q = query(collection(db, "comandas"), orderBy("fecha", "desc"));
  return onSnapshot(q, callback);
}

export function addComanda(data) {
  return addDoc(collection(db, "comandas"), data);
}

export function updateComandaStatus(id, status) {
  return updateDoc(doc(db, "comandas", id), {
    estado: status,
    updatedAt: serverTimestamp(),
  });
}

// 🔹 COMANDAS POR FECHA
export function getComandasByDate(dateString) {
  const start = new Date(dateString + "T00:00:00");
  const end = new Date(dateString + "T23:59:59");

  const q = query(
    collection(db, "comandas"),
    where("fecha", ">=", Timestamp.fromDate(start)),
    where("fecha", "<=", Timestamp.fromDate(end)),
    orderBy("fecha", "desc"),
  );

  return getDocs(q);
}
