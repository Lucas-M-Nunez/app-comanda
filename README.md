# app-comanda

Aplicación híbrida para comandas de café con Firebase en tiempo real.

## Estructura

- `index.html` - pantalla principal con login y comandas.
- `admin.html` - panel administrativo con ventas y gestión de productos.
- `css/styles.css` - estilos responsive y POS-friendly.
- `js/firebase-config.js` - configuración de Firebase.
- `js/firebase-service.js` - funciones de Firestore y listeners.
- `js/auth.js` - autenticación y control de roles.
- `js/app.js` - lógica de creación de comandas y estado en tiempo real.
- `js/admin.js` - panel de ventas, filtros e inventario de productos.
- `data/productos.js` - catálogo inicial para seed en Firestore.

## Firebase y autenticación

1. Crear un proyecto en Firebase.
2. Activar Authentication > Email/Password.
3. Crear usuarios para los roles: `Cajero`, `Barista`, `Mozo`, `Dueño`.
4. Crear colección `users` en Firestore con documentos cuyo ID sea el UID del usuario.
5. Cada documento debe tener al menos: `{ role: "Cajero" }`, `{ role: "Barista" }`, `{ role: "Mozo" }` o `{ role: "Dueño" }`.

## Configuración de Firebase

1. Copiar los datos de configuración desde Firebase Console.
2. Pegarlos en `js/firebase-config.js`.
3. Abrir `index.html` o `admin.html` en el navegador.

## Cómo probar

1. Abrir `index.html`.
2. Iniciar sesión con un usuario creado en Firebase.
3. Crear comandas desde `Cajero`, `Mozo` o `Dueño`.
4. Ver la sección "Comandas en tiempo real" desde `Barista` o `Dueño`.
5. Usar `admin.html` para ver ventas del día y administrar productos.

## Funcionalidades incluidas

- Login con Firebase Authentication.
- Roles y control de acceso.
- CRUD de productos en Firestore.
- Comandas en tiempo real con Firestore listeners.
- Estados de pedido: `Pendiente`, `En proceso`, `Finalizado`.
- Historial de ventas filtrable por fecha.

## Conversión a APK con Capacitor

1. `npm init -y`
2. `npm install @capacitor/core @capacitor/cli`
3. `npx cap init`
4. `npx cap add android`
5. `npx cap open android`

> Desde Android Studio podés generar la APK.
