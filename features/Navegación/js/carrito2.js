// ==========================================
// carrito2.js
// Funcionalidad de restaurantes.html
// - Protege sesión de consumidor
// - Carga restaurante dinámico por ID
// - Renderiza datos del restaurante
// - Renderiza platos del restaurante
// - Agrega productos al carrito con restauranteId
// ==========================================

let restauranteActual = null;


// =====================
// VALIDACIÓN DE SESIÓN
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

function protegerPaginaConsumidor() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a FoodFinder.");

        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";

        return false;
    }

    if (usuarioActivo.rol !== "cliente") {
        alert("Esta sección es solo para consumidores.");

        window.location.href =
            "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

        return false;
    }

    return true;
}


// =====================
// LOCALSTORAGE
// =====================

function obtenerRestaurantesRegistrados() {
    return JSON.parse(
        localStorage.getItem("foodfinder_restaurantes")
    ) || [];
}

function obtenerPlatosRegistrados() {
    return JSON.parse(
        localStorage.getItem("platos_data")
    ) || [];
}

function obtenerCarrito() {
    return JSON.parse(
        localStorage.getItem("foodfinder_cart")
    ) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(
        "foodfinder_cart",
        JSON.stringify(carrito)
    );
}


// =====================
// UTILIDADES
// =====================

function obtenerIdRestauranteDesdeURL() {
    const parametros =
        new URLSearchParams(window.location.search);

    return parametros.get("id");
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
        .toLowerCase();
}

function crearSlug(texto) {
    return normalizarTexto(texto)
        .replaceAll(" ", "-")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ó", "o")
        .replaceAll("ú", "u")
        .replaceAll("ñ", "n")
        .replace(/[^a-z0-9-]/g, "");
}

function formatearPrecio(precio) {
    return Number(precio || 0).toFixed(2);
}

// =====================
// RESEÑAS DEL RESTAURANTE
// =====================

function obtenerResenasRegistradas() {
    try {
        return JSON.parse(
            localStorage.getItem("foodfinder_resenas")
        ) || [];
    } catch (error) {
        return [];
    }
}

function obtenerResenasDelRestaurante(restaurante) {
    if (!restaurante) {
        return [];
    }

    return obtenerResenasRegistradas()
        .filter((resena) => {
            return (
                resena.restauranteId === restaurante.id ||
                resena.ownerEmail === restaurante.ownerEmail
            );
        });
}

function crearEstrellasVisual(calificacion) {
    const cantidad =
        Number(calificacion || 0);

    const llenas =
        "★".repeat(cantidad);

    const vacias =
        "★".repeat(5 - cantidad);

    return `
        <span style="color:#F59E0B;">${llenas}</span>
        <span style="color:#E4E8ED;">${vacias}</span>
    `;
}

function obtenerIniciales(nombre) {
    return String(nombre || "Cliente FoodFinder")
        .split(" ")
        .filter(parte => parte.trim().length > 0)
        .map(parte => parte[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function formatearFechaResena(fecha) {
    if (!fecha) {
        return "Reciente";
    }

    const fechaResena =
        new Date(fecha);

    if (isNaN(fechaResena.getTime())) {
        return "Reciente";
    }

    return fechaResena.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function calcularRatingPromedio(resenas, ratingBase) {
    if (resenas.length === 0) {
        return Number(ratingBase || 4.8);
    }

    const total =
        resenas.reduce((suma, resena) => {
            return suma + Number(resena.calificacion || 0);
        }, 0);

    return total / resenas.length;
}

function renderizarResenasRestaurante(restaurante) {
    const bigScore =
        document.querySelector(".big-score");

    const reviewsCount =
        document.querySelector(".reviews-count");

    const reviewsList =
        document.querySelector(".reviews-list");

    if (!bigScore || !reviewsCount || !reviewsList) {
        return;
    }

    const resenas =
        obtenerResenasDelRestaurante(restaurante);

    const promedio =
        calcularRatingPromedio(
            resenas,
            restaurante.rating
        );

    bigScore.textContent =
        promedio.toFixed(1);

    reviewsCount.textContent =
        `${resenas.length} reseña${resenas.length === 1 ? "" : "s"}`;

    const statRating =
        document.querySelector(".hero-stats-bar .stat-info strong");

    if (statRating) {
        statRating.textContent =
            promedio.toFixed(1);
    }

    if (resenas.length === 0) {
        reviewsList.innerHTML = `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-avatar">FF</div>
                    <div class="review-author">
                        <strong>FoodFinder</strong>
                        <span>Sin reseñas todavía</span>
                    </div>
                    <span class="review-stars" style="margin-left:auto; color:#F59E0B;">
                        ★★★★★
                    </span>
                </div>

                <p>
                    Este restaurante todavía no tiene reseñas. Sé el primero en dejar una opinión después de completar un pedido.
                </p>
            </div>
        `;

        return;
    }

    reviewsList.innerHTML =
        resenas
            .slice(-5)
            .reverse()
            .map((resena) => {
                return `
                    <div class="review-item" style="margin-top: 16px;">
                        <div class="review-header">
                            <div class="review-avatar">
                                ${escaparHTML(obtenerIniciales(resena.clienteNombre))}
                            </div>

                            <div class="review-author">
                                <strong>${escaparHTML(resena.clienteNombre)}</strong>
                                <span>${escaparHTML(formatearFechaResena(resena.fecha))}</span>
                            </div>

                            <span class="review-stars" style="margin-left:auto;">
                                ${crearEstrellasVisual(resena.calificacion)}
                            </span>
                        </div>

                        <p>${escaparHTML(resena.comentario)}</p>
                    </div>
                `;
            })
            .join("");
}

// =====================
// RESTAURANTE DINÁMICO
// =====================

function buscarRestaurantePorId(idRestaurante) {
    const restaurantes =
        obtenerRestaurantesRegistrados();

    return restaurantes.find((restaurante) => {
        return restaurante.id === idRestaurante;
    });
}

function cargarRestauranteActual() {
    const idRestaurante =
        obtenerIdRestauranteDesdeURL();

    if (!idRestaurante) {
        return null;
    }

    const restaurante =
        buscarRestaurantePorId(idRestaurante);

    if (!restaurante) {
        alert("No se encontró el restaurante seleccionado.");
        window.location.href = "home.html";
        return null;
    }

    restauranteActual = restaurante;

    return restauranteActual;
}

function actualizarVistaRestaurante(restaurante) {
    if (!restaurante) {
        return;
    }

    document.title =
        "Food Finder - " + restaurante.nombre;

    const breadcrumbActual =
        document.querySelector(".breadcrumb .current");

    if (breadcrumbActual) {
        breadcrumbActual.textContent =
            restaurante.nombre;
    }

    const tituloHero =
        document.querySelector(".hero-text h1");

    if (tituloHero) {
        tituloHero.textContent =
            restaurante.nombre || "Restaurante FoodFinder";
    }

    const descripcionHero =
        document.querySelector(".hero-text p");

    if (descripcionHero) {
        descripcionHero.textContent =
            `${restaurante.cocina || "Emprendimiento gastronómico"} · ${restaurante.direccion || restaurante.distrito || "Lima, Perú"}`;
    }

    const badgeEstado =
        document.querySelector(".badge-open-now");

    if (badgeEstado) {
        badgeEstado.textContent =
            restaurante.estado || "Abierto ahora";
    }

    const heroBanner =
        document.querySelector(".hero-banner");

    if (heroBanner && restaurante.imagen) {
        heroBanner.style.backgroundImage =
            `linear-gradient(rgba(28,43,57,0.72), rgba(28,43,57,0.72)), url("${restaurante.imagen}")`;

        heroBanner.style.backgroundSize =
            "cover";

        heroBanner.style.backgroundPosition =
            "center";
    }

    const heroLogoCircle =
        document.querySelector(".hero-logo-circle");

    if (heroLogoCircle && restaurante.logo) {
        heroLogoCircle.style.backgroundImage =
            `url("${restaurante.logo}")`;

        heroLogoCircle.style.backgroundSize =
            "cover";

        heroLogoCircle.style.backgroundPosition =
            "center";
    }

    const stats =
        document.querySelectorAll(".stat-info");

    if (stats[0]) {
        const strong =
            stats[0].querySelector("strong");

        if (strong) {
            strong.textContent =
                restaurante.rating || "4.8";
        }
    }

    if (stats[1]) {
        const strong =
            stats[1].querySelector("strong");

        if (strong) {
            strong.textContent =
                restaurante.horario || "Horario no registrado";
        }
    }

    actualizarInformacionGeneral(restaurante);
}

function actualizarInformacionGeneral(restaurante) {
    const infoList =
        document.querySelector(".info-list");

    if (!infoList) {
        return;
    }

    const direccion =
        restaurante.direccion || "Dirección pendiente";

    const distrito =
        restaurante.distrito || "Lima, Perú";

    const horario =
        restaurante.horario || "Horario no registrado";

    const telefono =
        restaurante.telefono || "Teléfono no registrado";

    const telefonoLimpio =
        telefono.replaceAll(" ", "");

    infoList.innerHTML = `
        <div class="info-item">
            <span class="icon">📍</span>
            <div class="info-text">
                <strong>${escaparHTML(direccion)}</strong>
                <span>${escaparHTML(distrito)}</span>
            </div>
        </div>

        <div class="info-item">
            <span class="icon">🕒</span>
            <div class="info-text">
                <strong>${escaparHTML(horario)}</strong>
                <span style="color: #4CAF50; font-weight: 600;">
                    ${escaparHTML(restaurante.estado || "Abierto ahora")}
                </span>
            </div>
        </div>

        <div class="info-item">
            <span class="icon" style="color: #E91E63;">📞</span>
            <div class="info-text">
                <a href="tel:${escaparHTML(telefonoLimpio)}">
                    <strong>${escaparHTML(telefono)}</strong>
                </a>
            </div>
        </div>
    `;
}


// =====================
// PLATOS DINÁMICOS
// =====================

function obtenerPlatosDelRestaurante(restaurante) {
    const platos =
        obtenerPlatosRegistrados();

    return platos.filter((plato) => {
        return (
            plato.restauranteId === restaurante.id ||
            plato.ownerEmail === restaurante.ownerEmail
        );
    });
}

function obtenerNombrePlato(plato) {
    return (
        plato.nombre ||
        plato.nombrePlato ||
        plato.titulo ||
        "Plato sin nombre"
    );
}

function obtenerDescripcionPlato(plato) {
    return (
        plato.descripcion ||
        plato.detalle ||
        "Plato registrado por el restaurante."
    );
}

function obtenerPrecioPlato(plato) {
    return Number(
        plato.precio ||
        plato.precioVenta ||
        plato.costo ||
        0
    );
}

function obtenerCategoriaPlato(plato) {
    return (
        plato.categoria ||
        "Carta"
    );
}

function obtenerImagenPlato(plato) {
    return (
        plato.imagen ||
        "../../../Assests/Img/Ceviche clasico.jpg"
    );
}

function platoEstaDisponible(plato) {
    if (plato.disponible === false) {
        return false;
    }

    if (plato.estado === "agotado") {
        return false;
    }

    const stock =
        Number(plato.stock ?? plato.cantidad ?? 1);

    return stock > 0;
}

function renderizarPlatosRestaurante(restaurante) {
    const menuColumn =
        document.querySelector(".menu-column");

    const tabsContainer =
        document.querySelector(".categories-tabs");

    if (!menuColumn || !tabsContainer) {
        return;
    }

    const platos =
        obtenerPlatosDelRestaurante(restaurante);

    if (platos.length === 0) {
        tabsContainer.innerHTML = `
            <button class="cat-tab active" data-target="carta">
                Carta
            </button>
        `;

        menuColumn.innerHTML = `
            <section class="menu-category-section">
                <h2 id="carta" class="category-title">Carta</h2>

                <div class="menu-items-grid">
                    <article class="menu-card">
                        <div class="menu-card-content">
                            <div class="menu-card-info">
                                <h4>Este restaurante todavía no tiene platos publicados</h4>
                                <p>
                                    El emprendedor podrá agregar platos desde el panel de Mis Platos.
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        `;

        return;
    }

    const categorias =
        [...new Set(
            platos.map((plato) => obtenerCategoriaPlato(plato))
        )];

    tabsContainer.innerHTML =
        categorias.map((categoria, index) => {
            return `
                <button
                    class="cat-tab ${index === 0 ? "active" : ""}"
                    data-target="${crearSlug(categoria)}">
                    ${escaparHTML(categoria)}
                </button>
            `;
        }).join("");

    menuColumn.innerHTML =
        categorias.map((categoria) => {
            const idCategoria =
                crearSlug(categoria);

            const platosCategoria =
                platos.filter((plato) => {
                    return obtenerCategoriaPlato(plato) === categoria;
                });

            return `
                <section class="menu-category-section">
                    <h2 id="${idCategoria}" class="category-title">
                        ${escaparHTML(categoria)}
                    </h2>

                    <div class="menu-items-grid">
                        ${platosCategoria.map((plato) => {
                            return crearHTMLPlato(plato);
                        }).join("")}
                    </div>
                </section>
            `;
        }).join("");
}

function crearHTMLPlato(plato) {
    const nombre =
        obtenerNombrePlato(plato);

    const descripcion =
        obtenerDescripcionPlato(plato);

    const precio =
        obtenerPrecioPlato(plato);

    const imagen =
        obtenerImagenPlato(plato);

    const disponible =
        platoEstaDisponible(plato);

    return `
        <article
            class="menu-card"
            data-plato-id="${escaparHTML(plato.id || "")}"
            data-restaurante-id="${escaparHTML(restauranteActual.id)}"
            data-owner-email="${escaparHTML(restauranteActual.ownerEmail)}">

            <div class="menu-card-img-wrapper">
                ${disponible ? "" : `<span class="badge top-left out-of-stock">Sin stock</span>`}

                <img
                    src="${escaparHTML(imagen)}"
                    alt="${escaparHTML(nombre)}"
                    style="${disponible ? "" : "opacity: 0.5;"}">
            </div>

            <div class="menu-card-content">
                <div class="menu-card-info">
                    <h4>${escaparHTML(nombre)}</h4>
                    <p>${escaparHTML(descripcion)}</p>
                </div>

                <div class="menu-card-bottom">
                    <div class="price-status">
                        <span class="current-price">
                            S/. ${formatearPrecio(precio)}
                        </span>

                        <span class="status-pill ${disponible ? "available" : ""}">
                            ${disponible ? "Disponible" : "Agotado"}
                        </span>
                    </div>

                    <button
                        class="btn-agregar ${disponible ? "" : "disabled"}"
                        ${disponible ? "" : "disabled"}>
                        ${disponible ? "Agregar" : "Agotado"}
                    </button>
                </div>
            </div>
        </article>
    `;
}


// =====================
// CARRITO
// =====================

function agregarAlCarrito(productoNuevo) {
    const carrito =
        obtenerCarrito();

    const index =
        carrito.findIndex((producto) => {
            return (
                producto.nombre === productoNuevo.nombre &&
                producto.restauranteId === productoNuevo.restauranteId
            );
        });

    if (index !== -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push(productoNuevo);
    }

    guardarCarrito(carrito);

    console.log(
        "Producto agregado:",
        productoNuevo.nombre
    );
}

function obtenerProductoDesdeMenuCard(boton) {
    const tarjeta =
        boton.closest(".menu-card");

    if (!tarjeta) {
        return null;
    }

    const nombreElemento =
        tarjeta.querySelector("h4");

    const precioElemento =
        tarjeta.querySelector(".current-price");

    if (!nombreElemento || !precioElemento) {
        return null;
    }

    const nombre =
        nombreElemento.textContent.trim();

    const precioTexto =
        precioElemento.textContent;

    const precio =
        parseFloat(
            precioTexto.replace(/[^0-9.]/g, "")
        );

    const imgElement =
        tarjeta.querySelector("img");

    const imagen =
        imgElement ? imgElement.src : "";

    const platoId =
        tarjeta.dataset.platoId || "";

    const restauranteId =
        tarjeta.dataset.restauranteId ||
        restauranteActual?.id ||
        "rest_static_rincon";

    const ownerEmail =
        tarjeta.dataset.ownerEmail ||
        restauranteActual?.ownerEmail ||
        "static@foodfinder.local";

    const restauranteNombre =
        restauranteActual?.nombre ||
        "El Rincón del Sabor";

    return {
        platoId,
        nombre,
        precio,
        imagen,
        cantidad: 1,
        restauranteId,
        ownerEmail,
        restauranteNombre
    };
}

function configurarBotonesAgregar() {
    const botonesAgregar =
        document.querySelectorAll(".btn-agregar");

    botonesAgregar.forEach((boton) => {

        boton.addEventListener("click", () => {

            if (
                boton.disabled ||
                boton.classList.contains("disabled")
            ) {
                return;
            }

            const producto =
                obtenerProductoDesdeMenuCard(boton);

            if (!producto) {
                return;
            }

            agregarAlCarrito(producto);

            const textoOriginal =
                boton.textContent;

            boton.textContent = "✓ Agregado";
            boton.style.backgroundColor = "#4CAF50";

            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.style.backgroundColor = "";
            }, 1000);

        });

    });
}


// =====================
// BUSCADOR
// =====================

function configurarBuscadorRestaurante() {
    const buscador =
        document.querySelector(".search-bar");

    if (!buscador) {
        return;
    }

    buscador.addEventListener("input", () => {
        const texto =
            buscador.value
                .trim()
                .toLowerCase();

        const cards =
            document.querySelectorAll(".menu-card");

        cards.forEach((card) => {
            const contenido =
                card.textContent.toLowerCase();

            if (contenido.includes(texto)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
}


// =====================
// TABS
// =====================

function configurarTabsCategorias() {
    const tabs =
        document.querySelectorAll(".cat-tab");

    if (tabs.length === 0) {
        return;
    }

    tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            tabs.forEach((item) => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            const target =
                tab.dataset.target;

            if (target) {
                document
                    .getElementById(target)
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                return;
            }

            const texto =
                tab.textContent
                    .trim()
                    .toLowerCase();

            if (texto.includes("más pedidos")) {
                document
                    .getElementById("mas-pedidos")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                return;
            }

            if (texto.includes("ceviches")) {
                document
                    .getElementById("ceviches")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                return;
            }

            alert(
                "Esta categoría estará disponible en la versión final."
            );

        });

    });
}


// =====================
// NAVEGACIÓN
// =====================

function configurarLogoRestaurante() {
    const logo =
        document.querySelector(".logo-completo-consumidor");

    if (!logo) {
        return;
    }

    logo.style.cursor = "pointer";

    logo.addEventListener("click", () => {
        window.location.href = "home.html";
    });
}

function configurarPerfilRestaurante() {
    const perfil =
        document.getElementById("btn-perfil") ||
        document.querySelector('img[alt="Perfil"]');

    if (!perfil) {
        return;
    }

    if (perfil.closest("a")) {
        return;
    }

    perfil.style.cursor = "pointer";

    perfil.addEventListener("click", () => {
        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";
    });
}


// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener("DOMContentLoaded", () => {
    const accesoPermitido =
        protegerPaginaConsumidor();

    if (!accesoPermitido) {
        return;
    }

    const restaurante =
        cargarRestauranteActual();

    if (restaurante) {
        actualizarVistaRestaurante(restaurante);
        renderizarPlatosRestaurante(restaurante);
        renderizarResenasRestaurante(restaurante);
    }

    configurarLogoRestaurante();
    configurarPerfilRestaurante();
    configurarBotonesAgregar();
    configurarBuscadorRestaurante();
    configurarTabsCategorias();
});