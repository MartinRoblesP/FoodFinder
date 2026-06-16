document.addEventListener('DOMContentLoaded', () => {
    renderizarCarritoPaso1();

    // Lógica para ir al checkout paso 2
    const btnContinuar = document.querySelectorAll('.btn-primary');
    btnContinuar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Aquí puedes redirigir a tu HTML del paso 2
            // Asegúrate de poner la ruta correcta según tus carpetas
            window.location.href = "Carrito_compras2.html"; 
        });
    });
});

function renderizarCarritoPaso1() {
    const carrito = JSON.parse(localStorage.getItem('foodfinder_cart')) || [];
    const contenedor = document.querySelector('.cart-items');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; padding: 20px;">Tu carrito está vacío 🛒</p>';
        actualizarTotales(0);
        return;
    }

    contenedor.innerHTML = ''; // Limpiar contenido demo
    let subtotal = 0;

    carrito.forEach((producto, index) => {
        subtotal += producto.precio * producto.cantidad;
        
        // Creamos la estructura HTML respetando tus clases CSS
        const itemHTML = `
            <div class="cart-item">
                <div class="item-img" style="background-image: url('${producto.imagen}');"></div>
                <div class="item-details">
                    <h4>${producto.nombre}</h4>
                    <span class="price">S/ ${producto.precio.toFixed(2)}</span>
                    <div class="quantity-control">
                        <button class="btn-qty" onclick="modificarCantidad(${index}, -1)">−</button>
                        <span class="qty-number">${producto.cantidad}</span>
                        <button class="btn-qty" onclick="modificarCantidad(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', itemHTML);
    });

    actualizarTotales(subtotal);
}

// Función global para que los botones onclick funcionen
window.modificarCantidad = function(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem('foodfinder_cart')) || [];
    
    carrito[index].cantidad += cambio;
    
    // Si la cantidad llega a 0, eliminar el producto
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    
    localStorage.setItem('foodfinder_cart', JSON.stringify(carrito));
    renderizarCarritoPaso1(); // Volver a pintar
};

function actualizarTotales(subtotal) {
    const delivery = subtotal > 0 ? 3.50 : 0;
    const total = subtotal + delivery;

    // Buscar las filas de totales. Respetamos tu HTML.
    const filasTotales = document.querySelectorAll('.total-row');
    if(filasTotales.length >= 3) {
        filasTotales[0].querySelectorAll('span')[1].innerText = `S/ ${subtotal.toFixed(2)}`;
        filasTotales[1].querySelectorAll('span')[1].innerText = `S/ ${delivery.toFixed(2)}`;
        filasTotales[2].querySelectorAll('span')[1].innerText = `S/ ${total.toFixed(2)}`;
    }
}


// =====================
// VALIDACIÓN DE SESIÓN CHECKOUT
// =====================

function obtenerUsuarioActivo() {
    return JSON.parse(
        localStorage.getItem("usuarioActivo")
    );
}

function protegerCheckout() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para realizar un pedido.");
        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";
        return;
    }

    if (usuarioActivo.rol !== "cliente") {
        alert("El checkout está disponible solo para consumidores.");
        window.location.href =
            "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";
        return;
    }
}

protegerCheckout();
