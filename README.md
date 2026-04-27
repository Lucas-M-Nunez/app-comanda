# app-comanda

Aplicación híbrida simple para comandas de café con persistencia en `localStorage`.

## Estructura

- `index.html` - pantalla principal de comandas.
- `css/styles.css` - estilos de la app.
- `js/app.js` - lógica de carrito y ventas.
- `data/productos.js` - catálogo de productos.
- `admin.html` - resumen de ventas del día.

## Cómo probar

1. Abrir `index.html` en el navegador.
2. Seleccionar productos para agregarlos al carrito.
3. Finalizar pedido para guardar la venta en `localStorage`.
4. Abrir `admin.html` para ver el total del día y el historial.

## Conversión a APK con Capacitor

1. `npm init -y`
2. `npm install @capacitor/core @capacitor/cli`
3. `npx cap init`
4. `npx cap add android`
5. `npx cap open android`

> Desde Android Studio podés generar la APK.
