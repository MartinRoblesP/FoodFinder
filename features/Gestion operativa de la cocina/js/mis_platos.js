// ==========================================
// mis_platos.js
// Gestión de platos por restaurante/emprendedor
// CRUD + localStorage + restauranteId + ownerEmail
// Navegación completa del panel
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================
    // SESIÓN Y RESTAURANTE
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

    function obtenerDatos(key) {
        try {
            return JSON.parse(
                localStorage.getItem(key)
            ) || [];
        } catch (error) {
            return [];
        }
    }

    function guardarDatos(key, data) {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    }

    function obtenerRestaurantesRegistrados() {
        return obtenerDatos("foodfinder_restaurantes");
    }

    function guardarRestaurantesRegistrados(restaurantes) {
        guardarDatos(
            "foodfinder_restaurantes",
            restaurantes
        );
    }

    function obtenerRestauranteActivo(usuario) {
        const restaurantes =
            obtenerRestaurantesRegistrados();

        let restaurante =
            restaurantes.find((item) => {
                return (
                    item.id === usuario.restauranteId ||
                    item.ownerEmail === usuario.correo
                );
            });

        if (!restaurante) {
            restaurante = {
                id: usuario.restauranteId || "rest_" + usuario.id,
                ownerEmail: usuario.correo,
                ownerName: usuario.nombre,
                nombre: "Restaurante de " + usuario.nombre.split(" ")[0],
                cocina: "Emprendimiento gastronómico",
                descripcion: "Restaurante registrado en FoodFinder.",
                direccion: usuario.direccionNegocio || "Dirección pendiente",
                distrito: "Lima",
                telefono: usuario.telefono || "",
                horario: "Lun–Dom 12:00pm – 10:00pm",
                estado: "Abierto",
                rating: 4.8,
                reviews: 0,
                imagen: "../../../Assests/Img/El rincon del sabor.jpg",
                fechaRegistro: new Date().toLocaleDateString()
            };

            restaurantes.push(restaurante);
            guardarRestaurantesRegistrados(restaurantes);

            usuario.restauranteId =
                restaurante.id;

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(usuario)
            );
        }

        return restaurante;
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

    const restauranteActual =
        obtenerRestauranteActivo(usuarioActivo);


    // =====================
    // ELEMENTOS
    // =====================

    const tbody =
        document.getElementById("tbodyPlatos") ||
        document.querySelector("table tbody");

    const btnAgregar =
        document.getElementById("btnAgregarPlato") ||
        document.querySelector(".btn_agregar");


    // =====================
    // LOCALSTORAGE
    // =====================

    const KEY_PLATOS =
        "platos_data";

    const KEY_HISTORIAL =
        "pedidosHistorial";

    let todosLosPlatos = [];
    let platosRestaurante = [];


    function obtenerTodosLosPlatos() {
        return obtenerDatos(KEY_PLATOS);
    }

    function guardarTodosLosPlatos(platos) {
        guardarDatos(
            KEY_PLATOS,
            platos
        );
    }

    function obtenerHistorialPedidos() {
        return obtenerDatos(KEY_HISTORIAL);
    }

    function perteneceAlRestaurante(plato) {
        return (
            plato.restauranteId === restauranteActual.id ||
            plato.ownerEmail === restauranteActual.ownerEmail
        );
    }

    function cargar() {
        todosLosPlatos =
            obtenerTodosLosPlatos();

        platosRestaurante =
            todosLosPlatos.filter(perteneceAlRestaurante);
    }

    function guardar() {
        const platosDeOtrosRestaurantes =
            todosLosPlatos.filter((plato) => {
                return !perteneceAlRestaurante(plato);
            });

        todosLosPlatos = [
            ...platosDeOtrosRestaurantes,
            ...platosRestaurante
        ];

        guardarTodosLosPlatos(todosLosPlatos);
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

    function normalizarTexto(texto) {
        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function obtenerEstado(plato) {
        return Number(plato.stock || 0) > 0
            ? "Disponible"
            : "Agotado";
    }

    function obtenerClaseEstado(plato) {
        return Number(plato.stock || 0) > 0
            ? "badge_con_stock"
            : "badge_sin_stock";
    }

    function sincronizarEstadoPlato(plato) {
        const stock =
            Number(plato.stock || 0);

        plato.disponible =
            stock > 0;

        plato.estado =
            stock > 0
                ? "disponible"
                : "agotado";

        return plato;
    }

    function contarPedidosDelPlato(plato) {
        const historial =
            obtenerHistorialPedidos();

        let total = 0;

        historial.forEach((pedido) => {
            const mismoRestaurante =
                pedido.restauranteId === restauranteActual.id ||
                pedido.ownerEmail === restauranteActual.ownerEmail;

            if (!mismoRestaurante) {
                return;
            }

            if (Array.isArray(pedido.items)) {
                pedido.items.forEach((item) => {
                    const mismoId =
                        item.platoId &&
                        plato.id &&
                        String(item.platoId) === String(plato.id);

                    const mismoNombre =
                        normalizarTexto(item.nombre) === normalizarTexto(plato.nombre);

                    if (mismoId || mismoNombre) {
                        total += Number(item.cantidad || 1);
                    }
                });

                return;
            }

            const textoPlatos =
                normalizarTexto(pedido.plato);

            if (textoPlatos.includes(normalizarTexto(plato.nombre))) {
                total += Number(pedido.cantidad || 1);
            }
        });

        return total;
    }

    function leerImagenComoBase64(input, callback) {
        if (!input.files || input.files.length === 0) {
            callback("");
            return;
        }

        const archivo =
            input.files[0];

        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona una imagen válida.");
            callback("");
            return;
        }

        const lector =
            new FileReader();

        lector.onload = function () {
            callback(lector.result);
        };

        lector.readAsDataURL(archivo);
    }


    // =====================
    // RENDER
    // =====================

    function render() {
        tbody.innerHTML =
            "";

        if (platosRestaurante.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="6">
                        Todavía no tienes platos registrados.
                        <br>
                        Usa el botón “Agregar plato” para crear tu carta.
                    </td>
                </tr>
            `;

            return;
        }

        platosRestaurante.forEach((plato) => {
            sincronizarEstadoPlato(plato);

            const fila =
                document.createElement("tr");

            fila.classList.add("tabla_fila");

            fila.innerHTML = `
                <td class="tabla_td">
                    ${escaparHTML(plato.nombre)}
                    <br>
                    <small style="color:#6B7280;">
                        ${escaparHTML(plato.categoria || "Carta")}
                    </small>
                </td>

                <td class="tabla_td">
                    S/ ${Number(plato.precio || 0).toFixed(2)}
                </td>

                <td class="tabla_td">
                    ${Number(plato.stock || 0)}
                </td>

                <td class="tabla_td">
                    <span class="${obtenerClaseEstado(plato)}">
                        ${obtenerEstado(plato)}
                    </span>
                </td>

                <td class="tabla_td">
                    ${contarPedidosDelPlato(plato)}
                </td>

                <td class="tabla_td tabla_acciones">
                    <button
                        type="button"
                        class="btn_editar"
                        data-id="${escaparHTML(plato.id)}">
                        ✏ Editar
                    </button>

                    <button
                        type="button"
                        class="btn_eliminar"
                        data-id="${escaparHTML(plato.id)}">
                        🗑
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });

        guardar();
        eventos();
    }


    // =====================
    // MODAL
    // =====================

    function modal(plato = null) {
        const overlay =
            document.createElement("div");

        overlay.className =
            "modal_bg";

        overlay.innerHTML = `
            <div class="modal_box">
                <h3>${plato ? "Editar plato" : "Agregar plato"}</h3>

                <label style="font-size: 13px; font-weight: 600;">
                    Nombre del plato
                </label>

                <input
                    id="m_nombre"
                    placeholder="Nombre del plato"
                    value="${plato ? escaparHTML(plato.nombre) : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">
                    Descripción
                </label>

                <textarea
                    id="m_descripcion"
                    placeholder="Descripción del plato">${plato ? escaparHTML(plato.descripcion || "") : ""}</textarea>

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">
                    Categoría
                </label>

                <select id="m_categoria">
                    <option value="Más pedidos">Más pedidos</option>
                    <option value="Ceviches y tiraditos">Ceviches y tiraditos</option>
                    <option value="Platos de fondo">Platos de fondo</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                    <option value="Carta">Carta</option>
                </select>

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">
                    Precio
                </label>

                <input
                    id="m_precio"
                    type="number"
                    min="0"
                    step="0.10"
                    placeholder="Precio"
                    value="${plato ? plato.precio : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">
                    Stock
                </label>

                <input
                    id="m_stock"
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value="${plato ? plato.stock : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">
                    Imagen del plato
                </label>

                <input
                    id="m_imagen"
                    type="file"
                    accept="image/*">

                ${
                    plato && plato.imagen
                        ? `
                            <p style="font-size: 12px; color:#6B7280;">
                                Si no seleccionas una imagen nueva, se conservará la actual.
                            </p>
                        `
                        : ""
                }

                <div class="modal_actions">
                    <button id="m_cancelar" type="button">
                        Cancelar
                    </button>

                    <button id="m_guardar" type="button">
                        Guardar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const selectCategoria =
            document.getElementById("m_categoria");

        if (plato && plato.categoria) {
            selectCategoria.value =
                plato.categoria;
        }

        document.getElementById("m_cancelar").onclick =
            function () {
                overlay.remove();
            };

        document.getElementById("m_guardar").onclick =
            function () {
                const nombre =
                    document.getElementById("m_nombre").value.trim();

                const descripcion =
                    document.getElementById("m_descripcion").value.trim();

                const categoria =
                    document.getElementById("m_categoria").value;

                const precio =
                    parseFloat(
                        document.getElementById("m_precio").value
                    );

                const stock =
                    parseInt(
                        document.getElementById("m_stock").value
                    );

                const inputImagen =
                    document.getElementById("m_imagen");

                if (
                    !nombre ||
                    !descripcion ||
                    isNaN(precio) ||
                    precio < 0 ||
                    isNaN(stock) ||
                    stock < 0
                ) {
                    alert("Completa nombre, descripción, precio y stock con valores válidos.");
                    return;
                }

                leerImagenComoBase64(inputImagen, function (imagenBase64) {
                    if (plato) {
                        plato.nombre =
                            nombre;

                        plato.descripcion =
                            descripcion;

                        plato.categoria =
                            categoria;

                        plato.precio =
                            precio;

                        plato.stock =
                            stock;

                        if (imagenBase64) {
                            plato.imagen =
                                imagenBase64;
                        }

                        sincronizarEstadoPlato(plato);
                    } else {
                        const nuevoPlato =
                            sincronizarEstadoPlato({
                                id: "plato_" + Date.now(),
                                restauranteId: restauranteActual.id,
                                ownerEmail: restauranteActual.ownerEmail,
                                restauranteNombre: restauranteActual.nombre,
                                nombre: nombre,
                                descripcion: descripcion,
                                categoria: categoria,
                                precio: precio,
                                stock: stock,
                                imagen: imagenBase64 || "../../../Assests/Img/Ceviche clasico.jpg",
                                fechaRegistro: new Date().toLocaleDateString()
                            });

                        platosRestaurante.push(nuevoPlato);
                    }

                    guardar();
                    overlay.remove();
                    cargar();
                    render();
                });
            };
    }


    // =====================
    // EVENTOS CRUD
    // =====================

    function eventos() {
        document.querySelectorAll(".btn_eliminar").forEach((btn) => {
            btn.onclick = function () {
                const id =
                    btn.dataset.id;

                const plato =
                    platosRestaurante.find((item) => {
                        return String(item.id) === String(id);
                    });

                if (!plato) {
                    return;
                }

                const confirmar =
                    confirm(`¿Deseas eliminar el plato "${plato.nombre}"?`);

                if (!confirmar) {
                    return;
                }

                platosRestaurante =
                    platosRestaurante.filter((item) => {
                        return String(item.id) !== String(id);
                    });

                guardar();
                cargar();
                render();
            };
        });

        document.querySelectorAll(".btn_editar").forEach((btn) => {
            btn.onclick = function () {
                const id =
                    btn.dataset.id;

                const plato =
                    platosRestaurante.find((item) => {
                        return String(item.id) === String(id);
                    });

                modal(plato);
            };
        });
    }

    if (btnAgregar) {
        btnAgregar.onclick =
            function () {
                modal();
            };
    }


    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
    // =====================

    function configurarNavegacionPanel() {
        const btnDashboard =
            document.getElementById("btn_dashboard") ||
            document.getElementById("btnDashboard") ||
            document.getElementById("btn_Dashboard");

        const btnLogoPanel =
            document.getElementById("btn-logo-panel");

        const btnBuscarPanel =
            document.getElementById("btn-buscar-panel");

        const btnPerfilPanel =
            document.getElementById("btn-perfil-panel");

        const btnSalir =
            document.getElementById("btn-salir");

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
                    "Puedes gestionar tus platos, stock, inventario, pedidos, estadísticas y configuración desde el menú lateral."
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
    }


    // =====================
    // INIT
    // =====================

    cargar();
    render();
    configurarNavegacionPanel();

});