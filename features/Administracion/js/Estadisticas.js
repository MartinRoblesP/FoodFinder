document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // RUTAS
    // =====================

    const RUTA_LOGIN =
        "../../Gestion de pedido/Pages/cuenta-cliente.html";

    const RUTA_HOME_CLIENTE =
        "../../Navegación/pages/home.html";

    const RUTA_PEDIDOS =
        "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

    const RUTA_CONFIG =
        "../../Gestion operativa de la cocina/pages/configuracion.html";

    const RUTA_LANDING =
        "../../../index.html";


    // =====================
    // UTILIDADES GENERALES
    // =====================

    function getData(key) {
        try {
            return JSON.parse(
                localStorage.getItem(key)
            ) || [];
        } catch (error) {
            return [];
        }
    }

    function saveData(key, data) {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    }

    function obtenerUsuarioActivo() {
        try {
            return JSON.parse(
                localStorage.getItem("usuarioActivo")
            );
        } catch (error) {
            return null;
        }
    }

    function guardarUsuarioActivo(usuario) {
        localStorage.setItem(
            "usuarioActivo",
            JSON.stringify(usuario)
        );
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizarTexto(texto) {
        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function obtenerFechaPedido(pedido) {
        const fechaBase =
            pedido.fechaFinalizado ||
            pedido.fecha ||
            "";

        if (!fechaBase) {
            return null;
        }

        const fecha =
            new Date(fechaBase);

        if (isNaN(fecha.getTime())) {
            return null;
        }

        return fecha;
    }

    function formatoFechaClave(fecha) {
        const year =
            fecha.getFullYear();

        const month =
            String(fecha.getMonth() + 1).padStart(2, "0");

        const day =
            String(fecha.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatoMesClave(fecha) {
        const year =
            fecha.getFullYear();

        const month =
            String(fecha.getMonth() + 1).padStart(2, "0");

        return `${year}-${month}`;
    }

    function obtenerHoyClave() {
        return formatoFechaClave(new Date());
    }

    function obtenerAyerClave() {
        const fecha =
            new Date();

        fecha.setDate(fecha.getDate() - 1);

        return formatoFechaClave(fecha);
    }

    function obtenerMesActualClave() {
        return formatoMesClave(new Date());
    }


    // =====================
    // VALIDACIÓN DE SESIÓN
    // =====================

    const usuarioActivo =
        obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder al panel.");

        window.location.href =
            RUTA_LOGIN;

        return;
    }

    if (usuarioActivo.rol !== "cocinero") {
        alert("Esta sección es solo para emprendedores gastronómicos.");

        window.location.href =
            RUTA_HOME_CLIENTE;

        return;
    }


    // =====================
    // RESTAURANTE ACTIVO
    // =====================

    function obtenerRestauranteActivo() {
        const restaurantes =
            getData("foodfinder_restaurantes");

        let restaurante =
            restaurantes.find((item) => {
                return (
                    item.id === usuarioActivo.restauranteId ||
                    item.ownerEmail === usuarioActivo.correo
                );
            });

        if (!restaurante) {
            restaurante = {
                id: usuarioActivo.restauranteId || "rest_" + usuarioActivo.id,
                ownerEmail: usuarioActivo.correo,
                ownerName: usuarioActivo.nombre,
                nombre: "Restaurante de " + usuarioActivo.nombre.split(" ")[0],
                cocina: "Emprendimiento gastronómico",
                descripcion: "Restaurante registrado en FoodFinder.",
                direccion: usuarioActivo.direccionNegocio || "Dirección pendiente",
                distrito: "Lima",
                telefono: usuarioActivo.telefono || "",
                horario: "Lun–Dom 12:00pm – 10:00pm",
                estado: "Abierto",
                rating: 4.8,
                reviews: 0,
                imagen: "../../../Assests/Img/El rincon del sabor.jpg",
                fechaRegistro: new Date().toLocaleDateString()
            };

            restaurantes.push(restaurante);

            saveData(
                "foodfinder_restaurantes",
                restaurantes
            );

            usuarioActivo.restauranteId =
                restaurante.id;

            guardarUsuarioActivo(usuarioActivo);
        }

        return restaurante;
    }

    const restauranteActual =
        obtenerRestauranteActivo();

    function perteneceAlRestaurante(item) {
        if (!item) {
            return false;
        }

        return (
            item.restauranteId === restauranteActual.id ||
            item.ownerEmail === restauranteActual.ownerEmail
        );
    }


    // =====================
    // DATA FILTRADA POR EMPRENDEDOR
    // =====================

    const pedidosHistorial =
        getData("pedidosHistorial")
            .filter(perteneceAlRestaurante);

    const pedidosFinalizados =
        pedidosHistorial.filter((pedido) => {
            const estado =
                normalizarTexto(pedido.estado);

            return (
                estado.includes("finalizado") ||
                estado.includes("entregado")
            );
        });

    const pedidosFinalizadosHoy =
        pedidosFinalizados.filter((pedido) => {
            const fecha =
                obtenerFechaPedido(pedido);

            if (!fecha) {
                return false;
            }

            return formatoFechaClave(fecha) === obtenerHoyClave();
        });

    const pedidosFinalizadosAyer =
        pedidosFinalizados.filter((pedido) => {
            const fecha =
                obtenerFechaPedido(pedido);

            if (!fecha) {
                return false;
            }

            return formatoFechaClave(fecha) === obtenerAyerClave();
        });

    const pedidosFinalizadosMes =
        pedidosFinalizados.filter((pedido) => {
            const fecha =
                obtenerFechaPedido(pedido);

            if (!fecha) {
                return false;
            }

            return formatoMesClave(fecha) === obtenerMesActualClave();
        });


    // =====================
    // ELEMENTOS DOM
    // =====================

    const valorVentasHoy =
        document.getElementById("valorVentasHoy");

    const valorPedidosHoy =
        document.getElementById("valorPedidosHoy");

    const valorTicketPromedio =
        document.getElementById("valorTicketPromedio");

    const variacionVentas =
        document.getElementById("variacionVentas");

    const variacionPedidos =
        document.getElementById("variacionPedidos");

    const variacionTicket =
        document.getElementById("variacionTicket");

    const graficoVentasDia =
        document.getElementById("graficoVentasDia");

    const graficoVentasMes =
        document.getElementById("graficoVentasMes");

    const platosMasVendidosDia =
        document.getElementById("platosMasVendidosDia");

    const platosMasVendidosMes =
        document.getElementById("platosMasVendidosMes");


    // =====================
    // CÁLCULOS PRINCIPALES
    // =====================

    function sumarVentas(listaPedidos) {
        return listaPedidos.reduce((total, pedido) => {
            return total + Number(pedido.total || 0);
        }, 0);
    }

    function calcularTicketPromedio(listaPedidos) {
        if (listaPedidos.length === 0) {
            return 0;
        }

        return sumarVentas(listaPedidos) / listaPedidos.length;
    }

    function calcularVariacion(actual, anterior) {
        if (anterior === 0 && actual === 0) {
            return "▲ 0% vs ayer";
        }

        if (anterior === 0 && actual > 0) {
            return "▲ 100% vs ayer";
        }

        const variacion =
            ((actual - anterior) / anterior) * 100;

        const simbolo =
            variacion >= 0
                ? "▲"
                : "▼";

        return `${simbolo} ${Math.abs(variacion).toFixed(0)}% vs ayer`;
    }


    // =====================
    // CARDS PRINCIPALES
    // =====================

    function pintarCards() {
        const ventasHoy =
            sumarVentas(pedidosFinalizadosHoy);

        const ventasAyer =
            sumarVentas(pedidosFinalizadosAyer);

        const pedidosHoy =
            pedidosFinalizadosHoy.length;

        const pedidosAyer =
            pedidosFinalizadosAyer.length;

        const ticketHoy =
            calcularTicketPromedio(pedidosFinalizadosHoy);

        const ticketAyer =
            calcularTicketPromedio(pedidosFinalizadosAyer);

        if (valorVentasHoy) {
            valorVentasHoy.textContent =
                `S/ ${ventasHoy.toFixed(2)}`;
        }

        if (valorPedidosHoy) {
            valorPedidosHoy.textContent =
                pedidosHoy;
        }

        if (valorTicketPromedio) {
            valorTicketPromedio.textContent =
                `S/ ${ticketHoy.toFixed(2)}`;
        }

        if (variacionVentas) {
            variacionVentas.textContent =
                calcularVariacion(ventasHoy, ventasAyer);
        }

        if (variacionPedidos) {
            variacionPedidos.textContent =
                calcularVariacion(pedidosHoy, pedidosAyer);
        }

        if (variacionTicket) {
            variacionTicket.textContent =
                calcularVariacion(ticketHoy, ticketAyer);
        }
    }


    // =====================
    // PLATOS VENDIDOS
    // =====================

    function limpiarNombrePlato(nombre) {
        return String(nombre || "")
            .replace(/^\d+x\s*/i, "")
            .trim();
    }

    function obtenerPlatosVendidos(listaPedidos) {
        const resumen = {};

        listaPedidos.forEach((pedido) => {

            if (Array.isArray(pedido.items)) {
                pedido.items.forEach((item) => {
                    const nombre =
                        limpiarNombrePlato(item.nombre);

                    const cantidad =
                        Number(item.cantidad || 1);

                    if (!nombre) {
                        return;
                    }

                    if (!resumen[nombre]) {
                        resumen[nombre] = 0;
                    }

                    resumen[nombre] += cantidad;
                });

                return;
            }

            const platos =
                String(pedido.plato || "")
                    .split(",")
                    .map((plato) => limpiarNombrePlato(plato))
                    .filter((plato) => plato.length > 0);

            platos.forEach((plato) => {
                if (!resumen[plato]) {
                    resumen[plato] = 0;
                }

                resumen[plato] += 1;
            });
        });

        return Object.entries(resumen)
            .map(([nombre, cantidad]) => {
                return {
                    nombre,
                    cantidad
                };
            })
            .sort((a, b) => {
                return b.cantidad - a.cantidad;
            });
    }


    // =====================
    // GRÁFICOS
    // =====================

    function crearGraficoBarras(contenedor, datos, etiquetas, prefijo = "") {
        if (!contenedor) {
            return;
        }

        contenedor.innerHTML =
            "";

        const hayDatos =
            datos.some((valor) => {
                return Number(valor) > 0;
            });

        if (!hayDatos) {
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
            const numero =
                Number(valor) || 0;

            const altura =
                numero > 0
                    ? (numero / maximo) * 90
                    : 5;

            const textoValor =
                prefijo
                    ? `${prefijo}${numero.toFixed(2)}`
                    : String(numero);

            const barraContenedor =
                document.createElement("div");

            barraContenedor.classList.add("barra-contenedor");

            barraContenedor.innerHTML = `
                <div
                    class="barra"
                    title="${textoValor}"
                    style="height: ${altura}px;">
                </div>

                <span class="label-barra">
                    ${escaparHTML(etiquetas[index])}
                </span>
            `;

            contenedor.appendChild(barraContenedor);
        });
    }

    function pintarVentasPorDia() {
        const hoy =
            new Date();

        const fechas = [];

        for (let i = 6; i >= 0; i--) {
            const fecha =
                new Date();

            fecha.setDate(hoy.getDate() - i);

            fechas.push(fecha);
        }

        const datos =
            fechas.map((fecha) => {
                const clave =
                    formatoFechaClave(fecha);

                const pedidosDelDia =
                    pedidosFinalizados.filter((pedido) => {
                        const fechaPedido =
                            obtenerFechaPedido(pedido);

                        if (!fechaPedido) {
                            return false;
                        }

                        return formatoFechaClave(fechaPedido) === clave;
                    });

                return sumarVentas(pedidosDelDia);
            });

        const etiquetas =
            fechas.map((fecha) => {
                return fecha.toLocaleDateString(
                    "es-PE",
                    {
                        day: "2-digit",
                        month: "2-digit"
                    }
                );
            });

        crearGraficoBarras(
            graficoVentasDia,
            datos,
            etiquetas,
            "S/ "
        );
    }

    function pintarVentasPorMes() {
        const hoy =
            new Date();

        const meses = [];

        for (let i = 5; i >= 0; i--) {
            const fecha =
                new Date(
                    hoy.getFullYear(),
                    hoy.getMonth() - i,
                    1
                );

            meses.push(fecha);
        }

        const datos =
            meses.map((fecha) => {
                const claveMes =
                    formatoMesClave(fecha);

                const pedidosDelMes =
                    pedidosFinalizados.filter((pedido) => {
                        const fechaPedido =
                            obtenerFechaPedido(pedido);

                        if (!fechaPedido) {
                            return false;
                        }

                        return formatoMesClave(fechaPedido) === claveMes;
                    });

                return sumarVentas(pedidosDelMes);
            });

        const etiquetas =
            meses.map((fecha) => {
                return fecha.toLocaleDateString(
                    "es-PE",
                    {
                        month: "short"
                    }
                );
            });

        crearGraficoBarras(
            graficoVentasMes,
            datos,
            etiquetas,
            "S/ "
        );
    }


    // =====================
    // LISTAS DE PLATOS
    // =====================

    function pintarListaPlatos(contenedor, listaPedidos, mensajeVacio) {
        if (!contenedor) {
            return;
        }

        contenedor.innerHTML =
            "";

        const platos =
            obtenerPlatosVendidos(listaPedidos);

        if (platos.length === 0) {
            contenedor.innerHTML = `
                <p style="padding: 12px;">
                    ${mensajeVacio}
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
                    <span>${escaparHTML(plato.nombre)}</span>
                    <strong>${plato.cantidad} vend.</strong>
                </div>

                <div class="linea-fondo">
                    <div
                        class="linea-verde"
                        style="width: ${porcentaje}%;">
                    </div>
                </div>
            `;

            contenedor.appendChild(item);
        });
    }

    function pintarPlatosMasVendidosDia() {
        pintarListaPlatos(
            platosMasVendidosDia,
            pedidosFinalizadosHoy,
            "No hay platos vendidos hoy."
        );
    }

    function pintarPlatosMasVendidosMes() {
        pintarListaPlatos(
            platosMasVendidosMes,
            pedidosFinalizadosMes,
            "No hay platos vendidos este mes."
        );
    }


    // =====================
    // NAVEGACIÓN
    // =====================

    function configurarNavegacion() {
        const btnDashboard =
            document.getElementById("btnDashboard") ||
            document.getElementById("btn_Dashboard") ||
            document.getElementById("btn_dashboard");

        const btnLogoPanel =
            document.getElementById("btn-logo-panel");

        const btnPerfilPanel =
            document.getElementById("btn-perfil-panel");

        const btnSalir =
            document.getElementById("btn-salir") ||
            document.getElementById("btnSalir") ||
            document.getElementById("linkSalir");

        if (btnLogoPanel) {
            btnLogoPanel.addEventListener("click", (e) => {
                e.preventDefault();

                window.location.href =
                    RUTA_PEDIDOS;
            });
        }

        if (btnDashboard) {
            btnDashboard.addEventListener("click", (e) => {
                e.preventDefault();

                window.location.href =
                    RUTA_PEDIDOS;
            });
        }

        if (btnPerfilPanel) {
            btnPerfilPanel.addEventListener("click", (e) => {
                e.preventDefault();

                window.location.href =
                    RUTA_CONFIG;
            });
        }

        if (btnSalir) {
            btnSalir.addEventListener("click", (e) => {
                e.preventDefault();

                const confirmar =
                    confirm("¿Deseas cerrar sesión?");

                if (!confirmar) {
                    return;
                }

                localStorage.removeItem("usuarioActivo");

                alert("Sesión cerrada correctamente.");

                window.location.href =
                    RUTA_LANDING;
            });
        }
    }


    // =====================
    // INIT
    // =====================

    pintarCards();
    pintarVentasPorDia();
    pintarVentasPorMes();
    pintarPlatosMasVendidosDia();
    pintarPlatosMasVendidosMes();
    configurarNavegacion();

});

document.addEventListener("DOMContentLoaded", () => {
    const btnMenuMobile = document.getElementById("btnMenuMobile");
    const btnCerrarSidebar = document.getElementById("btnCerrarSidebar");
    const sidebar = document.querySelector(".dashboard_sidebar");

    if (btnMenuMobile && btnCerrarSidebar && sidebar) {
        btnMenuMobile.addEventListener("click", () => {
            sidebar.classList.add("activo");
        });

        btnCerrarSidebar.addEventListener("click", () => {
            sidebar.classList.remove("activo");
        });
    }
});