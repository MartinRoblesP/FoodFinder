// ==========================================
// carrito2.js
// Funcionalidad de restaurantes.html
// - Protege sesión de consumidor
// - Agrega platos del restaurante al carrito
// - Buscador de platos
// - Tabs de categorías
// - Navegación básica del restaurante
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

function obtenerProductoDesdeMenuCard(boton) {
    const tarjeta =
        boton.closest(".menu-card");

    if (!tarjeta) {
        console.warn("No se encontró la tarjeta del producto.");
        return null;
    }

    const nombreElemento =
        tarjeta.querySelector("h4");

    const precioElemento =
        tarjeta.querySelector(".current-price");

    if (!nombreElemento || !precioElemento) {
        console.warn("No se encontró nombre o precio del producto.");
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
// BUSCADOR RESTAURANTE
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
// TABS DE CATEGORÍAS
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
// NAVEGACIÓN RESTAURANTE
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

function configurarTelefono() {
    const telefono =
        Array.from(document.querySelectorAll("strong"))
            .find(elemento =>
                elemento.textContent.includes("+51")
            );

    if (!telefono) {
        return;
    }

    if (telefono.closest("a")) {
        return;
    }

    telefono.style.cursor = "pointer";

    telefono.addEventListener("click", () => {
        window.location.href =
            "tel:+51984123456";
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

    configurarLogoRestaurante();
    configurarPerfilRestaurante();
    configurarTelefono();
    configurarBotonesAgregar();
    configurarBuscadorRestaurante();
    configurarTabsCategorias();
});