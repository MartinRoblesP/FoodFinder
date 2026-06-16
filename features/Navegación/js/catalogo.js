// ==========================================
// catalogo.js
// Funcionalidad de home.html
// - Protege sesión de consumidor
// - Agrega platos destacados al carrito
// - Buscador del home
// - Categorías del home
// - Botón filtros
// - Botón ver carta
// ==========================================


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
// CARRITO
// =====================

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

function agregarAlCarrito(productoNuevo) {
    const carrito = obtenerCarrito();

    const index = carrito.findIndex(
        producto => producto.nombre === productoNuevo.nombre
    );

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

function obtenerProductoDesdeTarjeta(boton) {
    const tarjeta =
        boton.closest(".plate-card");

    if (!tarjeta) {
        console.warn("No se encontró la tarjeta del plato.");
        return null;
    }

    const nombreElemento =
        tarjeta.querySelector("h4");

    const precioElemento =
        tarjeta.querySelector(".price");

    if (!nombreElemento || !precioElemento) {
        console.warn("No se encontró nombre o precio del plato.");
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

    return {
        nombre,
        precio,
        imagen,
        cantidad: 1
    };
}

function configurarBotonesAgregar() {
    const botonesAgregar =
        document.querySelectorAll(".btn-add");

    botonesAgregar.forEach((boton) => {

        boton.addEventListener("click", () => {

            if (
                boton.disabled ||
                boton.classList.contains("disabled")
            ) {
                return;
            }

            const producto =
                obtenerProductoDesdeTarjeta(boton);

            if (!producto) {
                return;
            }

            agregarAlCarrito(producto);

            const textoOriginal =
                boton.textContent;

            boton.textContent = "✓";
            boton.style.backgroundColor = "#4CAF50";

            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.style.backgroundColor = "";
            }, 1000);

        });

    });
}


// =====================
// FUNCIONES HOME
// =====================

function configurarLogoHome() {
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

function configurarBotonesVerCarta() {
    const botonesVerCarta =
        document.querySelectorAll(".btn-ver-carta");

    botonesVerCarta.forEach((boton) => {

        boton.addEventListener("click", () => {
            window.location.href = "restaurantes.html";
        });

    });
}

function configurarBotonFiltros() {
    const botonFiltros =
        document.querySelector(".btn-filter");

    if (!botonFiltros) {
        return;
    }

    botonFiltros.addEventListener("click", () => {
        alert(
            "Los filtros avanzados por precio, distrito y promociones estarán disponibles en la versión final."
        );
    });
}

function buscarEnHome(texto) {
    const cards =
        document.querySelectorAll(".resto-card, .plate-card");

    cards.forEach((card) => {
        const contenido =
            card.textContent.toLowerCase();

        if (contenido.includes(texto)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

function configurarBuscadorHome() {
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

        buscarEnHome(texto);
    });
}

function filtrarCardsPorCategoria(categoria) {
    const cards =
        document.querySelectorAll(".resto-card, .plate-card");

    cards.forEach((card) => {
        const contenido =
            card.textContent.toLowerCase();

        if (categoria.includes("todo")) {
            card.style.display = "";
            return;
        }

        if (contenido.includes(categoria)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

function configurarCategoriasHome() {
    const categorias =
        document.querySelectorAll(".cat-pill");

    categorias.forEach((categoria) => {

        categoria.addEventListener("click", () => {

            categorias.forEach((item) => {
                item.classList.remove("active");
            });

            categoria.classList.add("active");

            const textoCategoria =
                categoria.textContent
                    .trim()
                    .toLowerCase();

            filtrarCardsPorCategoria(textoCategoria);

        });

    });
}

function configurarPerfilHome() {
    const iconoPerfil =
        document.getElementById("btn-perfil") ||
        document.querySelector('img[alt="Perfil"]');

    if (!iconoPerfil) {
        return;
    }

    if (iconoPerfil.closest("a")) {
        return;
    }

    iconoPerfil.style.cursor = "pointer";

    iconoPerfil.addEventListener("click", () => {
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

    configurarLogoHome();
    configurarBotonesVerCarta();
    configurarBotonFiltros();
    configurarBuscadorHome();
    configurarCategoriasHome();
    configurarBotonesAgregar();
    configurarPerfilHome();
});