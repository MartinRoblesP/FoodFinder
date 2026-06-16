// ==========================================
// pedidos_entrantes.js
// Épica 4 - Gestión de pedidos (versión real)
// Con localStorage + render dinámico
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    //----------------------------------------
    // KEYS LOCALSTORAGE
    //----------------------------------------

    const KEY_ACTIVOS = "pedidosActivos";
    const KEY_HISTORIAL = "pedidosHistorial";

    //----------------------------------------
    // ELEMENTOS DOM
    //----------------------------------------

    const tbodyActivos = document.getElementById("tbody_pedidos_activos");
    const tbodyHistorial = document.getElementById("tbody_historial");

    //----------------------------------------
    // UTILIDADES LOCALSTORAGE
    //----------------------------------------

    function getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    //----------------------------------------
    // SEED INICIAL (desde HTML si no hay data)
    //----------------------------------------

    function seedFromHTML() {

        const filas = tbodyActivos.querySelectorAll("tr");
        const pedidos = [];

        filas.forEach(function (fila) {

            const celdas = fila.querySelectorAll("td");

            pedidos.push({
                id: celdas[0].textContent.trim(),
                plato: celdas[1].textContent.trim(),
                cliente: celdas[2].textContent.trim(),
                cantidad: celdas[3].textContent.trim(),
                estado: "preparando",
                hora: celdas[5].textContent.trim()
            });

        });

        saveData(KEY_ACTIVOS, pedidos);
        saveData(KEY_HISTORIAL, []);
    }

    //----------------------------------------
    // RENDER ACTIVOS
    //----------------------------------------

    function renderActivos() {

        const data = getData(KEY_ACTIVOS);
        tbodyActivos.innerHTML = "";

        data.forEach(function (p) {

            const tr = document.createElement("tr");
            tr.classList.add("tabla_fila");

            tr.innerHTML = `
                <td class="tabla_td">${p.id}</td>
                <td class="tabla_td">${p.plato}</td>
                <td class="tabla_td">${p.cliente}</td>
                <td class="tabla_td">${p.cantidad}</td>
                <td class="tabla_td">
                    <span class="badge_preparando">Preparando pedido</span>
                </td>
                <td class="tabla_td">${p.hora}</td>
                <td class="tabla_td tabla_acciones">
                    <button class="btn_finalizar">✔ Finalizar</button>
                    <button class="btn_cancelar">✖ Cancelar</button>
                </td>
            `;

            tbodyActivos.appendChild(tr);
        });
    }

    //----------------------------------------
    // RENDER HISTORIAL
    //----------------------------------------

    function renderHistorial() {

        const data = getData(KEY_HISTORIAL);
        tbodyHistorial.innerHTML = "";

        data.forEach(function (p) {

            const tr = document.createElement("tr");
            tr.classList.add("tabla_fila");

            tr.innerHTML = `
                <td class="tabla_td">${p.id}</td>
                <td class="tabla_td">${p.plato}</td>
                <td class="tabla_td">${p.cliente}</td>
                <td class="tabla_td">${p.cantidad}</td>
                <td class="tabla_td">S/ ${Number(p.total || 0).toFixed(2)}</td>
                <td class="tabla_td">${p.hora}</td>
            `;

            tbodyHistorial.appendChild(tr);
        });
    }

    //----------------------------------------
    // FINALIZAR PEDIDO
    //----------------------------------------

    function finalizarPedido(id) {

        let activos = getData(KEY_ACTIVOS);
        let historial = getData(KEY_HISTORIAL);

        const index = activos.findIndex(p => p.id === id);

        if (index !== -1) {

            const pedido = activos[index];

            // cambiar estado lógico
            pedido.estado = "finalizado";

            historial.push(pedido);
            activos.splice(index, 1);

            saveData(KEY_ACTIVOS, activos);
            saveData(KEY_HISTORIAL, historial);

            renderActivos();
            renderHistorial();
        }
    }

    //----------------------------------------
    // CANCELAR PEDIDO
    //----------------------------------------

    function cancelarPedido(id) {

        let activos = getData(KEY_ACTIVOS);

        activos = activos.filter(p => p.id !== id);

        saveData(KEY_ACTIVOS, activos);

        renderActivos();
    }

    //----------------------------------------
    // EVENT DELEGATION
    //----------------------------------------

    tbodyActivos.addEventListener("click", function (e) {

        const fila = e.target.closest("tr");
        if (!fila) return;

        const id = fila.children[0].textContent.trim();

        if (e.target.classList.contains("btn_finalizar")) {
            finalizarPedido(id);
        }

        if (e.target.classList.contains("btn_cancelar")) {
            cancelarPedido(id);
        }
    });

    //----------------------------------------
    // INIT
    //----------------------------------------

    const dataExiste = localStorage.getItem(KEY_ACTIVOS);

    if (!dataExiste) {
        seedFromHTML();
    }

    renderActivos();
    renderHistorial();

    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
    // =====================

    const usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo")
    );

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

    const btnDashboard =
        document.getElementById("btn_dashboard") ||
        document.getElementById("btnDashboard") ||
        document.getElementById("btn_Dashboard");

    if (btnDashboard) {

        btnDashboard.addEventListener("click", (e) => {

            e.preventDefault();

            window.location.href =
                "pedidos_entrantes.html";

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
                "configuracion.html";

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