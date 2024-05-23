document.addEventListener('DOMContentLoaded', function() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Función para actualizar la visualización del carrito
    function actualizarCarrito() {
        const carritoBody = document.getElementById('carrito-body');
        carritoBody.innerHTML = ''; // Limpiamos el contenido previo del cuerpo de la tabla

        carrito.forEach((producto, index) => {
            const fila = `
                <tr>
                    <th scope="row">${index + 1}</th>
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.cantidad}</td>
                </tr>
            `;
            carritoBody.innerHTML += fila;
        });
    }

    // Llamamos a la función de actualización al cargar la página
    actualizarCarrito();
});
;
