// ==========================================
// pedidos_entrantes.js
// Gestión de pedidos por restaurante/emprendedor
// localStorage + render dinámico + filtro por restauranteId / ownerEmail
// Navegación completa del panel
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================
    // KEYS LOCALSTORAGE
    // =====================

    const KEY_ACTIVOS =
        "pedidosActivos";

    const KEY_HISTORIAL =
        "pedidosHistorial";

    const KEY_RESTAURANTES =
        "foodfinder_restaurantes";


    // =====================
    // ELEMENTOS DOM
    // =====================

    const tbodyActivos =
        document.getElementById("tbody_pedidos_activos");

    const tbodyHistorial =
        document.getElementById("tbody_historial");

    const btnDashboard =
        document.getElementById("btn_dashboard");

    const btnLogoPanel =
        document.getElementById("btn-logo-panel");

    const btnBuscarPanel =
        document.getElementById("btn-buscar-panel");

    const btnPerfilPanel =
        document.getElementById("btn-perfil-panel");

    const btnSalir =
        document.getElementById("btn-salir");


    // =====================
    // UTILIDADES LOCALSTORAGE
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


    // =====================
    // VALIDACIÓN DE SESIÓN
    // =====================

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


    // =====================
    // RESTAURANTE ACTIVO
    // =====================

    function obtenerRestauranteActivo() {
        const restaurantes =
            getData(KEY_RESTAURANTES);

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
                KEY_RESTAURANTES,
                restaurantes
            );

            usuarioActivo.restauranteId =
                restaurante.id;

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(usuarioActivo)
            );
        }

        return restaurante;
    }

    const restauranteActual =
        obtenerRestauranteActivo();

    function perteneceAlRestaurante(pedido) {
        return (
            pedido.restauranteId === restauranteActual.id ||
            pedido.ownerEmail === restauranteActual.ownerEmail
        );
    }


    // =====================
    // UTILIDADES
    // =====================

    function escaparHTML(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function obtenerClaseEstadoHistorial(estado) {
        const estadoNormalizado =
            String(estado || "").toLowerCase();

        if (estadoNormalizado.includes("cancelado")) {
            return "badge_cancelado";
        }

        return "badge_entregado";
    }

    function obtenerTextoEstadoHistorial(estado) {
        const estadoNormalizado =
            String(estado || "").toLowerCase();

        if (estadoNormalizado.includes("cancelado")) {
            return "Cancelado";
        }

        return "Entregado";
    }


    // =====================
    // RENDER ACTIVOS
    // =====================

    function renderActivos() {
        const pedidosActivos =
            getData(KEY_ACTIVOS);

        const pedidosDelRestaurante =
            pedidosActivos.filter(perteneceAlRestaurante);

        tbodyActivos.innerHTML =
            "";

        if (pedidosDelRestaurante.length === 0) {
            tbodyActivos.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="7">
                        No tienes pedidos activos por ahora.
                    </td>
                </tr>
            `;

            return;
        }

        pedidosDelRestaurante.forEach(function (p) {
            const tr =
                document.createElement("tr");

            tr.classList.add("tabla_fila");

            tr.innerHTML = `
                <td class="tabla_td">${escaparHTML(p.id)}</td>

                <td class="tabla_td">${escaparHTML(p.plato)}</td>

                <td class="tabla_td">${escaparHTML(p.cliente)}</td>

                <td class="tabla_td">${escaparHTML(p.cantidad)}</td>

                <td class="tabla_td">
                    <span class="badge_preparando">
                        Preparando pedido
                    </span>
                </td>

                <td class="tabla_td">${escaparHTML(p.hora)}</td>

                <td class="tabla_td tabla_acciones">
                    <button
                        type="button"
                        class="btn_finalizar"
                        data-id="${escaparHTML(p.id)}">
                        ✔ Finalizar
                    </button>

                    <button
                        type="button"
                        class="btn_cancelar"
                        data-id="${escaparHTML(p.id)}">
                        ✖ Cancelar
                    </button>
                </td>
            `;

            tbodyActivos.appendChild(tr);
        });
    }


    // =====================
    // RENDER HISTORIAL
    // =====================

    function renderHistorial() {
        const historial =
            getData(KEY_HISTORIAL);

        const historialDelRestaurante =
            historial.filter(perteneceAlRestaurante);

        tbodyHistorial.innerHTML =
            "";

        if (historialDelRestaurante.length === 0) {
            tbodyHistorial.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="7">
                        Todavía no tienes pedidos finalizados o cancelados.
                    </td>
                </tr>
            `;

            return;
        }

        historialDelRestaurante.forEach(function (p) {
            const estadoTexto =
                obtenerTextoEstadoHistorial(p.estado);

            const claseEstado =
                obtenerClaseEstadoHistorial(p.estado);

            const tr =
                document.createElement("tr");

            tr.classList.add("tabla_fila");

            tr.innerHTML = `
                <td class="tabla_td">${escaparHTML(p.id)}</td>

                <td class="tabla_td">${escaparHTML(p.plato)}</td>

                <td class="tabla_td">${escaparHTML(p.cliente)}</td>

                <td class="tabla_td">${escaparHTML(p.cantidad)}</td>

                <td class="tabla_td">
                    S/ ${Number(p.total || 0).toFixed(2)}
                </td>

                <td class="tabla_td">
                    <span class="${claseEstado}">
                        ${estadoTexto}
                    </span>
                </td>

                <td class="tabla_td">${escaparHTML(p.hora)}</td>
            `;

            tbodyHistorial.appendChild(tr);
        });
    }


    // =====================
    // FINALIZAR PEDIDO
    // =====================

    function finalizarPedido(id) {
        const confirmar =
            confirm("¿Confirmas que este pedido fue entregado?");

        if (!confirmar) {
            return;
        }

        const activos =
            getData(KEY_ACTIVOS);

        const historial =
            getData(KEY_HISTORIAL);

        const index =
            activos.findIndex((pedido) => {
                return (
                    pedido.id === id &&
                    perteneceAlRestaurante(pedido)
                );
            });

        if (index === -1) {
            return;
        }

        const pedido =
            activos[index];

        pedido.estado =
            "finalizado";

        pedido.fechaFinalizado =
            new Date().toISOString();

        historial.push(pedido);

        activos.splice(index, 1);

        saveData(
            KEY_ACTIVOS,
            activos
        );

        saveData(
            KEY_HISTORIAL,
            historial
        );

        renderActivos();
        renderHistorial();
    }


    // =====================
    // CANCELAR PEDIDO
    // =====================

    function cancelarPedido(id) {
        const confirmar =
            confirm("¿Seguro que deseas cancelar este pedido?");

        if (!confirmar) {
            return;
        }

        const activos =
            getData(KEY_ACTIVOS);

        const historial =
            getData(KEY_HISTORIAL);

        const index =
            activos.findIndex((pedido) => {
                return (
                    pedido.id === id &&
                    perteneceAlRestaurante(pedido)
                );
            });

        if (index === -1) {
            return;
        }

        const pedido =
            activos[index];

        pedido.estado =
            "cancelado";

        pedido.fechaCancelado =
            new Date().toISOString();

        historial.push(pedido);

        activos.splice(index, 1);

        saveData(
            KEY_ACTIVOS,
            activos
        );

        saveData(
            KEY_HISTORIAL,
            historial
        );

        renderActivos();
        renderHistorial();
    }


    // =====================
    // EVENT DELEGATION
    // =====================

    tbodyActivos.addEventListener("click", function (e) {
        const botonFinalizar =
            e.target.closest(".btn_finalizar");

        const botonCancelar =
            e.target.closest(".btn_cancelar");

        if (botonFinalizar) {
            finalizarPedido(
                botonFinalizar.dataset.id
            );

            return;
        }

        if (botonCancelar) {
            cancelarPedido(
                botonCancelar.dataset.id
            );

            return;
        }
    });


    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
    // =====================

    if (btnLogoPanel) {
        btnLogoPanel.addEventListener("click", function (e) {
            e.preventDefault();

            window.location.href =
                "pedidos_entrantes.html";
        });
    }

    if (btnDashboard) {
        btnDashboard.addEventListener("click", function (e) {
            e.preventDefault();

            window.location.href =
                "pedidos_entrantes.html";
        });
    }

    if (btnBuscarPanel) {
        btnBuscarPanel.addEventListener("click", function () {
            alert(
                "Puedes revisar tus pedidos activos, platos, inventario, estadísticas y configuración desde el menú lateral."
            );
        });
    }

    if (btnPerfilPanel) {
        btnPerfilPanel.addEventListener("click", function () {
            window.location.href =
                "configuracion.html";
        });
    }

    if (btnSalir) {
        btnSalir.addEventListener("click", function (e) {
            e.preventDefault();

            const confirmar =
                confirm("¿Deseas cerrar sesión?");

            if (!confirmar) {
                return;
            }

            localStorage.removeItem("usuarioActivo");

            alert("Sesión cerrada correctamente.");

            window.location.href =
                "../../../index.html";
        });
    }


    // =====================
    // INIT
    // =====================

    renderActivos();
    renderHistorial();

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