function getUserProfile(uid) {
  return db.collection("users").doc(uid).get();
}

function onUserProfile(uid, callback) {
  return db.collection("users").doc(uid).onSnapshot(callback);
}

function onProductosSnapshot(callback) {
  return db.collection("productos").orderBy("categoria").onSnapshot(callback);
}

function addProducto(data) {
  return db.collection("productos").add(data);
}

function updateProducto(id, data) {
  return db.collection("productos").doc(id).update(data);
}

function deleteProducto(id) {
  return db.collection("productos").doc(id).delete();
}

function seedProductosIfEmpty(localProducts) {
  return db.collection("productos").limit(1).get().then(snapshot => {
    if (!snapshot.empty) return Promise.resolve();
    const batch = db.batch();
    localProducts.forEach(producto => {
      const docRef = db.collection("productos").doc();
      batch.set(docRef, {
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    return batch.commit();
  });
}

function onComandasSnapshot(callback) {
  return db.collection("comandas").orderBy("fecha", "desc").onSnapshot(callback);
}

function addComanda(data) {
  return db.collection("comandas").add(data);
}

function updateComandaStatus(id, status) {
  return db.collection("comandas").doc(id).update({
    estado: status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function getComandasByDate(dateString) {
  const start = new Date(dateString + "T00:00:00");
  const end = new Date(dateString + "T23:59:59");
  return db.collection("comandas")
    .where("fecha", ">=", firebase.firestore.Timestamp.fromDate(start))
    .where("fecha", "<=", firebase.firestore.Timestamp.fromDate(end))
    .orderBy("fecha", "desc")
    .get();
}
