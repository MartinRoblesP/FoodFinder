// =====================
// VALIDACIÓN DE SESIÓN MIS PEDIDOS
// =====================

function obtenerUsuarioActivo() {
    return JSON.parse(
        localStorage.getItem("usuarioActivo")
    );
}

function protegerMisPedidos() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para ver tus pedidos.");
        window.location.href =
            "cuenta-cliente.html";
        return;
    }

    if (usuarioActivo.rol !== "cliente") {
        alert("Esta sección es solo para consumidores.");
        window.location.href =
            "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";
        return;
    }
}

protegerMisPedidos();

document.addEventListener("DOMContentLoaded", () => {

    const tablaPedidoActivo =
        document.getElementById("tablaPedidoActivo");

    const tablaHistorialPedidos =
        document.getElementById("tablaHistorialPedidos");

    const mensajeSinPedido =
        document.getElementById("mensajeSinPedido");

    const mensajeSinHistorial =
        document.getElementById("mensajeSinHistorial");

    const mensajeErrorConexion =
        document.getElementById("mensajeErrorConexion");

    const btnCarrito =
        document.getElementById("btnCarrito");

    const btnUsuario =
        document.getElementById("btnUsuario");

    const KEY_ACTIVOS = "pedidosActivos";
    const KEY_HISTORIAL = "pedidosHistorial";

    function obtenerDatos(key) {

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    }

    function obtenerClaseEstado(estado) {

        const estadoNormalizado =
            String(estado || "")
                .toLowerCase();

        if (estadoNormalizado.includes("preparando")) {
            return "estado-preparando";
        }

        if (estadoNormalizado.includes("listo")) {
            return "estado-listo";
        }

        if (
            estadoNormalizado.includes("entregado") ||
            estadoNormalizado.includes("finalizado")
        ) {
            return "estado-entregado";
        }

        return "estado-recibido";

    }

    function formatearEstado(estado) {

        const estadoNormalizado =
            String(estado || "")
                .toLowerCase();

        if (estadoNormalizado.includes("preparando")) {
            return "Preparando pedido";
        }

        if (estadoNormalizado.includes("finalizado")) {
            return "Entregado";
        }

        if (estadoNormalizado.includes("cancelado")) {
            return "Cancelado";
        }

        return "Recibido";

    }

    function mostrarPedidoActivo() {

        const pedidosActivos =
            obtenerDatos(KEY_ACTIVOS);

        tablaPedidoActivo.innerHTML = "";
        mensajeSinPedido.textContent = "";

        if (mensajeErrorConexion) {
            mensajeErrorConexion.style.display = "none";
            mensajeErrorConexion.textContent = "";
        }

        if (pedidosActivos.length === 0) {

            mensajeSinPedido.textContent =
                "No tienes pedidos en curso actualmente.";

            return;

        }

        pedidosActivos.forEach((pedido) => {

            const estadoTexto =
                formatearEstado(pedido.estado);

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <strong>${pedido.id}</strong>
                </td>

                <td>
                    <strong>${pedido.plato}</strong>
                </td>

                <td>
                    <strong>${pedido.cantidad}</strong>
                </td>

                <td>
                    <strong>${pedido.hora}</strong>
                </td>

                <td>
                    <span class="${obtenerClaseEstado(pedido.estado)}">
                        ${estadoTexto}
                    </span>
                </td>

                <td>
                    <strong>25 - 35 min</strong>
                </td>

                <td>
                    El Rincón del Sabor
                </td>
            `;

            tablaPedidoActivo.appendChild(fila);

        });

    }

    function mostrarHistorialPedidos() {

        const historial =
            obtenerDatos(KEY_HISTORIAL);

        tablaHistorialPedidos.innerHTML = "";
        mensajeSinHistorial.textContent = "";

        if (historial.length === 0) {

            mensajeSinHistorial.textContent =
                "Todavía no tienes pedidos anteriores.";

            return;

        }

        historial.forEach((pedido) => {

            const estadoTexto =
                formatearEstado(pedido.estado);

            const total =
                Number(pedido.total || 0);

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <strong>${pedido.id}</strong>
                </td>

                <td>
                    <strong>${pedido.plato}</strong>
                </td>

                <td>
                    <strong>${pedido.cantidad}</strong>
                </td>

                <td>
                    <strong>${pedido.hora}</strong>
                </td>

                <td>
                    El Rincón del Sabor
                </td>

                <td>
                    S/ ${total.toFixed(2)}
                </td>

                <td>
                    <span class="${obtenerClaseEstado(pedido.estado)}">
                        ${estadoTexto}
                    </span>
                </td>

                <td>
                    <button type="button" class="btn-resena">
                        Dejar reseña
                    </button>
                </td>
            `;

            tablaHistorialPedidos.appendChild(fila);

        });

        configurarBotonesResena();

    }

    function configurarBotonesResena() {

        const botonesResena =
            document.querySelectorAll(".btn-resena");

        botonesResena.forEach((boton) => {

            boton.addEventListener("click", () => {

                alert(
                    "Funcionalidad de reseñas disponible en la versión final."
                );

            });

        });

    }

    if (btnCarrito) {

        btnCarrito.addEventListener("click", () => {

            window.location.href =
                "../../Gestión pago/pages/Carrito_compras1.html";

        });

    }

    if (btnUsuario) {

        btnUsuario.addEventListener("click", () => {

            window.location.href =
                "cuenta-cliente.html";

        });

    }

    mostrarPedidoActivo();
    mostrarHistorialPedidos();

});