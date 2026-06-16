document.addEventListener("DOMContentLoaded", () => {
    // =====================
    // VALIDACIÓN DE SESIÓN ESTADÍSTICAS
      // =====================

    function obtenerUsuarioActivo() {
        try {
            return JSON.parse(
                localStorage.getItem("usuarioActivo")
            );
        } catch (error) {
            return null;
        }
    }

    const usuarioActivo =
        obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder al panel.");

        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";

        return;
    }

    if (usuarioActivo.rol !== "cocinero") {
        alert("Esta sección es solo para emprendedores gastronómicos.");

        window.location.href =
            "../../Navegación/pages/home.html";

        return;
    }



    const pedidosHistorial =
        JSON.parse(localStorage.getItem("pedidosHistorial")) || [];

    const pedidosActivos =
        JSON.parse(localStorage.getItem("pedidosActivos")) || [];

    const valorVentasHoy =
        document.getElementById("valorVentasHoy");

    const valorPedidosHoy =
        document.getElementById("valorPedidosHoy");

    const valorTicketPromedio =
        document.getElementById("valorTicketPromedio");

    const graficoVentasDia =
        document.getElementById("graficoVentasDia");

    const graficoVentasMes =
        document.getElementById("graficoVentasMes");

    const platosMasVendidosDia =
        document.getElementById("platosMasVendidosDia");

    const platosMasVendidosMes =
        document.getElementById("platosMasVendidosMes");

    function calcularVentasTotales() {

        return pedidosHistorial.reduce((total, pedido) => {

            return total + Number(pedido.total || 0);

        }, 0);

    }

    function calcularCantidadPedidos() {

        return pedidosHistorial.length;

    }

    function calcularTicketPromedio() {

        const cantidadPedidos =
            calcularCantidadPedidos();

        if (cantidadPedidos === 0) {
            return 0;
        }

        return calcularVentasTotales() / cantidadPedidos;

    }

    function pintarCards() {

        const ventas =
            calcularVentasTotales();

        const pedidos =
            calcularCantidadPedidos();

        const ticket =
            calcularTicketPromedio();

        valorVentasHoy.textContent =
            `S/ ${ventas.toFixed(2)}`;

        valorPedidosHoy.textContent =
            pedidos;

        valorTicketPromedio.textContent =
            `S/ ${ticket.toFixed(2)}`;

    }

    function obtenerPlatosVendidos() {

        const resumen = {};

        pedidosHistorial.forEach((pedido) => {

            const cantidadPedido =
                Number(pedido.cantidad || 1);

            const platos =
                String(pedido.plato || "")
                    .split(",")
                    .map(plato => plato.trim())
                    .filter(plato => plato.length > 0);

            platos.forEach((plato) => {

                if (!resumen[plato]) {
                    resumen[plato] = 0;
                }

                resumen[plato] += cantidadPedido;

            });

        });

        return Object.entries(resumen)
            .map(([nombre, cantidad]) => ({
                nombre,
                cantidad
            }))
            .sort((a, b) => b.cantidad - a.cantidad);

    }

    function crearGraficoBarras(contenedor, datos, etiquetas) {

        contenedor.innerHTML = "";

        if (datos.length === 0) {

            contenedor.innerHTML = `
                <p style="padding: 12px;">
                    No hay datos suficientes para mostrar el gráfico.
                </p>
            `;

            return;

        }

        const maximo =
            Math.max(...datos, 1);

        datos.forEach((valor, index) => {

            const altura =
                valor > 0
                    ? (valor / maximo) * 90
                    : 5;

            const barraContenedor =
                document.createElement("div");

            barraContenedor.classList.add("barra-contenedor");

            barraContenedor.innerHTML = `
                <div
                    class="barra"
                    title="S/ ${valor.toFixed(2)}"
                    style="height: ${altura}px;">
                </div>

                <span class="label-barra">
                    ${etiquetas[index]}
                </span>
            `;

            contenedor.appendChild(barraContenedor);

        });

    }

    function pintarVentasPorPedido() {

        const datos =
            pedidosHistorial
                .slice(-8)
                .map(pedido =>
                    Number(pedido.total || 0)
                );

        const etiquetas =
            pedidosHistorial
                .slice(-8)
                .map((pedido, index) =>
                    pedido.id || `P${index + 1}`
                );

        crearGraficoBarras(
            graficoVentasDia,
            datos,
            etiquetas
        );

    }

    function pintarResumenMensualEstimado() {

        const ventas =
            calcularVentasTotales();

        const datos =
            ventas > 0
                ? [
                    ventas * 0.45,
                    ventas * 0.60,
                    ventas * 0.75,
                    ventas
                ]
                : [];

        const etiquetas =
            ["Sem 1", "Sem 2", "Sem 3", "Actual"];

        crearGraficoBarras(
            graficoVentasMes,
            datos,
            etiquetas
        );

    }

    function pintarPlatosMasVendidos() {

        const platos =
            obtenerPlatosVendidos();

        platosMasVendidosDia.innerHTML = "";

        if (platos.length === 0) {

            platosMasVendidosDia.innerHTML = `
                <p style="padding: 12px;">
                    No hay platos vendidos todavía.
                </p>
            `;

            return;

        }

        const total =
            platos.reduce((suma, plato) => {
                return suma + plato.cantidad;
            }, 0);

        platos.slice(0, 5).forEach((plato) => {

            const porcentaje =
                total > 0
                    ? (plato.cantidad / total) * 100
                    : 0;

            const item =
                document.createElement("div");

            item.classList.add("item-plato");

            item.innerHTML = `
                <div class="info-plato">
                    <span>${plato.nombre}</span>
                    <strong>${porcentaje.toFixed(0)}%</strong>
                </div>

                <div class="linea-fondo">
                    <div
                        class="linea-verde"
                        style="width: ${porcentaje}%;">
                    </div>
                </div>
            `;

            platosMasVendidosDia.appendChild(item);

        });

    }

    function pintarPedidosRecientes() {

        platosMasVendidosMes.innerHTML = "";

        if (pedidosHistorial.length === 0) {

            platosMasVendidosMes.innerHTML = `
                <p style="padding: 12px;">
                    No hay pedidos finalizados.
                </p>
            `;

            return;

        }

        pedidosHistorial
            .slice(-4)
            .reverse()
            .forEach((pedido) => {

                const item =
                    document.createElement("div");

                item.classList.add("item-plato");

                item.innerHTML = `
                    <div class="info-plato">
                        <span>${pedido.id} - ${pedido.plato}</span>
                        <strong>S/ ${Number(pedido.total || 0).toFixed(2)}</strong>
                    </div>

                    <div class="linea-fondo">
                        <div
                            class="linea-verde"
                            style="width: 100%;">
                        </div>
                    </div>
                `;

                platosMasVendidosMes.appendChild(item);

            });

    }

    function mostrarAvisoSiNoHayHistorial() {

        if (pedidosHistorial.length === 0 && pedidosActivos.length > 0) {

            console.info(
                "Hay pedidos activos, pero todavía no hay pedidos finalizados para estadísticas."
            );

        }

    }
    pintarCards();
    pintarVentasPorPedido();
    pintarResumenMensualEstimado();
    pintarPlatosMasVendidos();
    pintarPedidosRecientes();
    mostrarAvisoSiNoHayHistorial();

    // =====================
    // NAVEGACIÓN SUPERIOR ESTADÍSTICAS
    // =====================

    const btnDashboard =
        document.getElementById("btnDashboard") ||
        document.getElementById("btn_Dashboard") ||
        document.getElementById("btn_dashboard");

    if (btnDashboard) {

        btnDashboard.addEventListener("click", (e) => {

            e.preventDefault();

            window.location.href =
                "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

        });

    }

    const btnPerfil =
        document.getElementById("btn-perfil") ||
        document.getElementById("btnPerfil") ||
        document.querySelector('img[alt="usuario"]') ||
        document.querySelector('img[alt="Perfil"]') ||
        document.querySelector('img[alt="perfil"]');

    if (btnPerfil) {

        btnPerfil.style.cursor = "pointer";

        btnPerfil.addEventListener("click", (e) => {

            e.preventDefault();

            window.location.href =
                "../../Gestion operativa de la cocina/pages/configuracion.html";

        });

    }

    const btnSalir =
        document.getElementById("btn-salir") ||
        document.getElementById("btnSalir") ||
        document.getElementById("linkSalir");

    if (btnSalir) {

        btnSalir.addEventListener("click", (e) => {

            e.preventDefault();

            localStorage.removeItem("usuarioActivo");

            alert("Sesión cerrada correctamente.");

            window.location.href =
                "../../../index.html";

        });

    }
});