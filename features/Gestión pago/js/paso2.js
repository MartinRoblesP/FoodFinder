document.addEventListener("DOMContentLoaded", () => {

    renderizarResumenPedido();

    const btnVolver =
        document.querySelector(".btn-secondary");

    if (btnVolver) {

        btnVolver.addEventListener("click", () => {

            window.location.href =
                "Carrito_compras1.html";

        });

    }

    const btnConfirmar =
        document.getElementById("btn-confirmar-pedido") ||
        buscarBotonPorTexto("Confirmar");

    if (btnConfirmar) {

        btnConfirmar.addEventListener("click", (e) => {

            e.preventDefault();

            confirmarPedido(btnConfirmar);

        });

    }

});

function renderizarResumenPedido() {

    const carrito =
        JSON.parse(
            localStorage.getItem("foodfinder_cart")
        ) || [];

    const contenedor =
        document.getElementById("order-items") ||
        document.querySelector(".order-items");

    if (!contenedor) {
        console.warn("No se encontró el contenedor del resumen del pedido.");
        return;
    }

    contenedor.innerHTML = "";

    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <p style="padding: 15px;">
                No hay productos en el carrito.
            </p>
        `;

        actualizarTotales(0);
        return;
    }

    let subtotal = 0;

    carrito.forEach((producto) => {

        const cantidad =
            Number(producto.cantidad) || 1;

        const precio =
            Number(producto.precio) || 0;

        const totalProducto =
            precio * cantidad;

        subtotal += totalProducto;

        const itemHTML = `
            <div class="order-item">
                <span>
                    ${cantidad}x ${producto.nombre}
                </span>

                <span class="price">
                    S/ ${totalProducto.toFixed(2)}
                </span>
            </div>
        `;

        contenedor.insertAdjacentHTML(
            "beforeend",
            itemHTML
        );

    });

    actualizarTotales(subtotal);

}

function actualizarTotales(subtotal) {

    const delivery =
        subtotal > 0 ? 3.50 : 0;

    const total =
        subtotal + delivery;

    const filasTotales =
        document.querySelectorAll(".total-row");

    if (filasTotales.length >= 3) {

        filasTotales[0]
            .querySelectorAll("span")[1]
            .textContent =
            `S/ ${subtotal.toFixed(2)}`;

        filasTotales[1]
            .querySelectorAll("span")[1]
            .textContent =
            `S/ ${delivery.toFixed(2)}`;

        filasTotales[2]
            .querySelectorAll("span")[1]
            .textContent =
            `S/ ${total.toFixed(2)}`;

    }

}

function confirmarPedido(btnConfirmar) {

    const carrito =
        JSON.parse(
            localStorage.getItem("foodfinder_cart")
        ) || [];

    if (carrito.length === 0) {

        alert("No hay productos en el carrito.");
        return;

    }

    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Procesando...";

    const pedidosActivos =
        JSON.parse(
            localStorage.getItem("pedidosActivos")
        ) || [];

    const subtotal =
        carrito.reduce((acumulado, producto) => {

            const precio =
                Number(producto.precio) || 0;

            const cantidad =
                Number(producto.cantidad) || 1;

            return acumulado + precio * cantidad;

        }, 0);

    const cantidadTotal =
        carrito.reduce((acumulado, producto) => {

            const cantidad =
                Number(producto.cantidad) || 1;

            return acumulado + cantidad;

        }, 0);

    const nombresPlatos =
        carrito
            .map(producto => producto.nombre)
            .join(", ");

    const nuevoPedido = {

        id:
            "#" +
            Date.now()
                .toString()
                .slice(-4),

        plato: nombresPlatos,

        cliente: "Cliente Demo",

        cantidad: cantidadTotal,

        estado: "preparando",

        hora:
            new Date()
                .toLocaleTimeString(
                    "es-PE",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        total: subtotal

    };

    pedidosActivos.push(nuevoPedido);

    localStorage.setItem(
        "pedidosActivos",
        JSON.stringify(pedidosActivos)
    );

    localStorage.removeItem("foodfinder_cart");

        alert(
            "Pedido confirmado. Tu comida está en camino."
        );

        window.location.href =
         "../../Navegación/pages/home.html";

}

function buscarBotonPorTexto(texto) {

    const botones =
        document.querySelectorAll("button");

    return Array
        .from(botones)
        .find(boton =>
            boton.textContent
                .toLowerCase()
                .includes(texto.toLowerCase())
        );

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
