// ==========================================
// mis_platos.js
// Épica 4 - Gestión de platos
// CRUD + localStorage + modal limpio
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // ELEMENTOS
    // =========================
    const tbody = document.querySelector("table tbody");
    const btnAgregar = document.querySelector(".btn_agregar");

    // =========================
    // LOCAL STORAGE
    // =========================
    const KEY = "platos_data";
    let platos = [];

    // =========================
    // DATOS INICIALES
    // =========================
    const datosIniciales = [
        { id: 1, nombre: "Seco de pollo", precio: 30, stock: 15 },
        { id: 2, nombre: "Locro de zapallo", precio: 15, stock: 8 }
    ];

    // =========================
    // CARGAR
    // =========================
    function cargar() {
        const data = localStorage.getItem(KEY);
        platos = data ? JSON.parse(data) : datosIniciales;
        guardar();
    }

    function guardar() {
        localStorage.setItem(KEY, JSON.stringify(platos));
    }

    // =========================
    // ESTADO
    // =========================
    function obtenerEstado(plato) {
        return plato.stock > 0 ? "Disponible" : "Agotado";
    }

    // =========================
    // RENDER
    // =========================
    function render() {

        tbody.innerHTML = "";

        platos.forEach(p => {

            const fila = document.createElement("tr");
            fila.classList.add("tabla_fila");

            fila.innerHTML = `
                <td class="tabla_td">${p.nombre}</td>
                <td class="tabla_td">S/ ${p.precio}</td>
                <td class="tabla_td">${p.stock}</td>
                <td class="tabla_td">${obtenerEstado(p)}</td>
                <td class="tabla_td">0</td>
                <td class="tabla_td tabla_acciones">
                    <button class="btn_editar" data-id="${p.id}">✏ Editar</button>
                    <button class="btn_eliminar" data-id="${p.id}">🗑</button>
                </td>
            `;

            tbody.appendChild(fila);
        });

        eventos();
    }

    // =========================
    // MODAL (AGREGAR / EDITAR)
    // =========================
    function modal(plato = null) {

        const overlay = document.createElement("div");
        overlay.className = "modal_bg";

        overlay.innerHTML = `
            <div class="modal_box">
                <h3>${plato ? "Editar plato" : "Agregar plato"}</h3>

                <input id="m_nombre" placeholder="Nombre" value="${plato ? plato.nombre : ""}">
                <input id="m_precio" type="number" placeholder="Precio" value="${plato ? plato.precio : ""}">
                <input id="m_stock" type="number" placeholder="Stock" value="${plato ? plato.stock : ""}">

                <div class="modal_actions">
                    <button id="m_cancelar">Cancelar</button>
                    <button id="m_guardar">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.querySelector("#m_cancelar").onclick = () => overlay.remove();

        document.querySelector("#m_guardar").onclick = () => {

            const nombre = document.querySelector("#m_nombre").value.trim();
            const precio = parseFloat(document.querySelector("#m_precio").value);
            const stock = parseInt(document.querySelector("#m_stock").value);

            if (!nombre || isNaN(precio) || isNaN(stock)) return;

            if (plato) {
                plato.nombre = nombre;
                plato.precio = precio;
                plato.stock = stock;
            } else {
                platos.push({
                    id: Date.now(),
                    nombre,
                    precio,
                    stock
                });
            }

            guardar();
            overlay.remove();
            render();
        };
    }

    // =========================
    // EVENTOS
    // =========================
    function eventos() {

        document.querySelectorAll(".btn_eliminar").forEach(btn => {
            btn.onclick = () => {
                const id = Number(btn.dataset.id);
                platos = platos.filter(p => p.id !== id);
                guardar();
                render();
            };
        });

        document.querySelectorAll(".btn_editar").forEach(btn => {
            btn.onclick = () => {
                const id = Number(btn.dataset.id);
                const plato = platos.find(p => p.id === id);
                modal(plato);
            };
        });
    }

    // =========================
    // AGREGAR
    // =========================
    btnAgregar.onclick = () => modal();

    // =========================
    // INIT
    // =========================
    cargar();
    render();

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