// ==========================================
// catalogo.js
// Home FoodFinder
// - Protege sesión consumidor
// - Crea restaurantes base dinámicos
// - Crea cartas base dinámicas
// - Renderiza todos los restaurantes desde localStorage
// - Agrega platos destacados al carrito con restauranteId
// - Buscador, categorías, Ver más, Ver carta
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
    const usuarioActivo =
        obtenerUsuarioActivo();

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

function obtenerCarrito() {
    return obtenerDatos("foodfinder_cart");
}

function guardarCarrito(carrito) {
    guardarDatos(
        "foodfinder_cart",
        carrito
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

function obtenerPlatosRegistrados() {
    return obtenerDatos("platos_data");
}

function guardarPlatosRegistrados(platos) {
    guardarDatos(
        "platos_data",
        platos
    );
}

function obtenerResenasRegistradas() {
    return obtenerDatos("foodfinder_resenas");
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

function obtenerTextoCategoria(categoriaElemento) {
    const label =
        categoriaElemento.querySelector(".cat-label");

    if (label) {
        return normalizarTexto(label.textContent);
    }

    return normalizarTexto(categoriaElemento.textContent);
}

function calcularPromedioResenas(resenas, ratingBase) {
    if (resenas.length === 0) {
        return Number(ratingBase || 4.8);
    }

    const total =
        resenas.reduce((suma, resena) => {
            return suma + Number(resena.calificacion || 0);
        }, 0);

    return total / resenas.length;
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

function obtenerRatingRestaurante(restaurante) {
    const resenas =
        obtenerResenasDelRestaurante(restaurante);

    const promedio =
        calcularPromedioResenas(
            resenas,
            restaurante.rating
        );

    return promedio.toFixed(1);
}

function obtenerCantidadResenasRestaurante(restaurante) {
    const resenas =
        obtenerResenasDelRestaurante(restaurante);

    if (resenas.length > 0) {
        return resenas.length;
    }

    return Number(restaurante.reviews || 0);
}


// =====================
// DATA BASE DINÁMICA
// =====================

const RESTAURANTES_BASE = [
    {
        id: "rest_osaka_sushi_bar",
        ownerEmail: "osaka@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "Osaka Sushi Bar",
        cocina: "Cocina Japonesa",
        descripcion: "Sushi, ramen y platos japoneses preparados al momento.",
        direccion: "Av. Primavera 120, Surco",
        distrito: "Lima, Perú",
        telefono: "+51 987 654 111",
        horario: "Lun–Dom 12:00pm – 10:00pm",
        estado: "Abierto",
        rating: 4.9,
        reviews: 498,
        imagen: "../../../Assests/Img/osaka-sushi-bar.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    },
    {
        id: "rest_green_bowl",
        ownerEmail: "greenbowl@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "Green Bowl",
        cocina: "Comida Saludable",
        descripcion: "Bowls, opciones veganas y comida saludable para todos los días.",
        direccion: "Av. La Mar 450, Miraflores",
        distrito: "Lima, Perú",
        telefono: "+51 987 654 222",
        horario: "Lun–Sáb 10:00am – 9:00pm",
        estado: "Abierto",
        rating: 4.8,
        reviews: 267,
        imagen: "../../../Assests/Img/Green Bowl.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    },
    {
        id: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "El Rincón del Sabor",
        cocina: "Cocina Peruana",
        descripcion: "Ceviches, lomo saltado y platos criollos con sabor casero.",
        direccion: "Jr. Schell 320, Miraflores",
        distrito: "Lima, Perú",
        telefono: "+51 984 123 456",
        horario: "Lun–Dom 12:00pm – 10:00pm",
        estado: "Abierto",
        rating: 4.9,
        reviews: 521,
        imagen: "../../../Assests/Img/El rincon del sabor.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    },
    {
        id: "rest_trattoria_moderna",
        ownerEmail: "trattoria@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "La Trattoria Moderna",
        cocina: "Comida Italiana",
        descripcion: "Pastas artesanales, salsas caseras y platos italianos.",
        direccion: "Av. Benavides 850, Miraflores",
        distrito: "Lima, Perú",
        telefono: "+51 987 654 333",
        horario: "Mar–Dom 1:00pm – 10:00pm",
        estado: "Abierto",
        rating: 4.8,
        reviews: 184,
        imagen: "../../../Assests/Img/tagliatelle carbonara.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    },
    {
        id: "rest_almuerzo_casa",
        ownerEmail: "almuerzo@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "Almuerzo de casa",
        cocina: "Comida Casera Peruana",
        descripcion: "Almuerzos caseros, guisos, pollo y platos familiares.",
        direccion: "Calle Los Cedros 210, San Borja",
        distrito: "Lima, Perú",
        telefono: "+51 987 654 444",
        horario: "Lun–Vie 11:00am – 4:00pm",
        estado: "Abierto",
        rating: 4.9,
        reviews: 126,
        imagen: "../../../Assests/Img/pollo chimichurri.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    },
    {
        id: "rest_burger_craft",
        ownerEmail: "burger@foodfinder.local",
        ownerName: "FoodFinder Demo",
        nombre: "Burger Craft Co.",
        cocina: "Comida Americana",
        descripcion: "Hamburguesas artesanales, papas y salsas de la casa.",
        direccion: "Av. Caminos del Inca 530, Surco",
        distrito: "Lima, Perú",
        telefono: "+51 987 654 555",
        horario: "Lun–Dom 12:00pm – 11:00pm",
        estado: "Abierto",
        rating: 4.7,
        reviews: 205,
        imagen: "../../../Assests/Img/smash burger doble.jpg",
        fechaRegistro: new Date().toLocaleDateString(),
        esBase: true
    }
];

const PLATOS_BASE = [
    {
        id: "plato_osaka_1",
        restauranteId: "rest_osaka_sushi_bar",
        ownerEmail: "osaka@foodfinder.local",
        restauranteNombre: "Osaka Sushi Bar",
        nombre: "Maki Acevichado",
        descripcion: "Roll de langostino empanizado con salsa acevichada y palta.",
        categoria: "Más pedidos",
        precio: 34,
        stock: 12,
        disponible: true,
        imagen: "../../../Assests/Img/osaka-sushi-bar.jpg"
    },
    {
        id: "plato_osaka_2",
        restauranteId: "rest_osaka_sushi_bar",
        ownerEmail: "osaka@foodfinder.local",
        restauranteNombre: "Osaka Sushi Bar",
        nombre: "Ramen Shoyu",
        descripcion: "Caldo japonés con fideos, huevo, cerdo y cebollita china.",
        categoria: "Platos de fondo",
        precio: 39,
        stock: 9,
        disponible: true,
        imagen: "../../../Assests/Img/osaka-sushi-bar.jpg"
    },
    {
        id: "plato_green_1",
        restauranteId: "rest_green_bowl",
        ownerEmail: "greenbowl@foodfinder.local",
        restauranteNombre: "Green Bowl",
        nombre: "Bowl Vegano",
        descripcion: "Quinua, palta, garbanzos, vegetales frescos y aliño de la casa.",
        categoria: "Más pedidos",
        precio: 29,
        stock: 10,
        disponible: true,
        imagen: "../../../Assests/Img/Green Bowl.jpg"
    },
    {
        id: "plato_green_2",
        restauranteId: "rest_green_bowl",
        ownerEmail: "greenbowl@foodfinder.local",
        restauranteNombre: "Green Bowl",
        nombre: "Ensalada Power",
        descripcion: "Mix de hojas verdes, pollo grillado, frutos secos y vinagreta.",
        categoria: "Platos de fondo",
        precio: 31,
        stock: 8,
        disponible: true,
        imagen: "../../../Assests/Img/Green Bowl.jpg"
    },
    {
        id: "plato_rincon_1",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Ceviche Clásico",
        descripcion: "Pescado fresco marinado en limón, ají limo, cebolla morada y culantro.",
        categoria: "Más pedidos",
        precio: 32,
        stock: 10,
        disponible: true,
        imagen: "../../../Assests/Img/Ceviche clasico.jpg"
    },
    {
        id: "plato_rincon_2",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Lomo Saltado",
        descripcion: "Lomo salteado con cebolla, tomate, papas fritas y arroz blanco.",
        categoria: "Platos de fondo",
        precio: 38,
        stock: 10,
        disponible: true,
        imagen: "../../../Assests/Img/lomo saltado.jpg"
    },
    {
        id: "plato_rincon_3",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Causa de Pollo",
        descripcion: "Papa amarilla con pollo, mayonesa y palta.",
        categoria: "Más pedidos",
        precio: 22,
        stock: 7,
        disponible: true,
        imagen: "../../../Assests/Img/causa de pollo.jpg"
    },
    {
        id: "plato_rincon_4",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Arroz con Leche",
        descripcion: "Postre clásico con leche, canela y vainilla.",
        categoria: "Postres",
        precio: 14,
        stock: 6,
        disponible: true,
        imagen: "../../../Assests/Img/arroz con leche.jpg"
    },
    {
        id: "plato_rincon_5",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Ceviche Mixto",
        descripcion: "Pescado, mariscos y pulpo en leche de tigre.",
        categoria: "Ceviches y tiraditos",
        precio: 45,
        stock: 6,
        disponible: true,
        imagen: "../../../Assests/Img/ceviche mixto.jpg"
    },
    {
        id: "plato_rincon_6",
        restauranteId: "rest_rincon_sabor",
        ownerEmail: "rincon@foodfinder.local",
        restauranteNombre: "El Rincón del Sabor",
        nombre: "Tiradito de Lenguado",
        descripcion: "Láminas de pescado con salsa de ají amarillo y limón.",
        categoria: "Ceviches y tiraditos",
        precio: 36,
        stock: 5,
        disponible: true,
        imagen: "../../../Assests/Img/tiradito.jpg"
    },
    {
        id: "plato_trattoria_1",
        restauranteId: "rest_trattoria_moderna",
        ownerEmail: "trattoria@foodfinder.local",
        restauranteNombre: "La Trattoria Moderna",
        nombre: "Tagliatelle Carbonara",
        descripcion: "Pasta artesanal con salsa carbonara, queso y panceta.",
        categoria: "Más pedidos",
        precio: 32,
        stock: 0,
        disponible: false,
        estado: "agotado",
        imagen: "../../../Assests/Img/tagliatelle carbonara.jpg"
    },
    {
        id: "plato_trattoria_2",
        restauranteId: "rest_trattoria_moderna",
        ownerEmail: "trattoria@foodfinder.local",
        restauranteNombre: "La Trattoria Moderna",
        nombre: "Pasta Pomodoro",
        descripcion: "Pasta con salsa de tomate, albahaca y queso parmesano.",
        categoria: "Platos de fondo",
        precio: 28,
        stock: 7,
        disponible: true,
        imagen: "../../../Assests/Img/tagliatelle carbonara.jpg"
    },
    {
        id: "plato_almuerzo_1",
        restauranteId: "rest_almuerzo_casa",
        ownerEmail: "almuerzo@foodfinder.local",
        restauranteNombre: "Almuerzo de casa",
        nombre: "Pollo Chimichurri",
        descripcion: "Pollo dorado con chimichurri, arroz y ensalada fresca.",
        categoria: "Más pedidos",
        precio: 36,
        stock: 6,
        disponible: true,
        imagen: "../../../Assests/Img/pollo chimichurri.jpg"
    },
    {
        id: "plato_almuerzo_2",
        restauranteId: "rest_almuerzo_casa",
        ownerEmail: "almuerzo@foodfinder.local",
        restauranteNombre: "Almuerzo de casa",
        nombre: "Ají de Gallina",
        descripcion: "Clásico plato casero con crema de ají amarillo, pollo y arroz.",
        categoria: "Platos de fondo",
        precio: 30,
        stock: 8,
        disponible: true,
        imagen: "../../../Assests/Img/pollo chimichurri.jpg"
    },
    {
        id: "plato_burger_1",
        restauranteId: "rest_burger_craft",
        ownerEmail: "burger@foodfinder.local",
        restauranteNombre: "Burger Craft Co.",
        nombre: "Smash Burger Doble",
        descripcion: "Doble carne smash, queso cheddar, pickles y salsa especial.",
        categoria: "Más pedidos",
        precio: 38,
        stock: 3,
        disponible: true,
        imagen: "../../../Assests/Img/smash burger doble.jpg"
    },
    {
        id: "plato_burger_2",
        restauranteId: "rest_burger_craft",
        ownerEmail: "burger@foodfinder.local",
        restauranteNombre: "Burger Craft Co.",
        nombre: "Papas Craft",
        descripcion: "Papas crocantes con salsa de queso y tocino.",
        categoria: "Platos de fondo",
        precio: 18,
        stock: 10,
        disponible: true,
        imagen: "../../../Assests/Img/smash burger doble.jpg"
    }
];

function inicializarRestaurantesBase() {
    const restaurantes =
        obtenerRestaurantesRegistrados();

    let huboCambios =
        false;

    RESTAURANTES_BASE.forEach((restauranteBase) => {
        const existe =
            restaurantes.some((restaurante) => {
                return restaurante.id === restauranteBase.id;
            });

        if (!existe) {
            restaurantes.push(restauranteBase);
            huboCambios = true;
        }
    });

    if (huboCambios) {
        guardarRestaurantesRegistrados(restaurantes);
    }
}

function inicializarPlatosBase() {
    const platos =
        obtenerPlatosRegistrados();

    let huboCambios =
        false;

    PLATOS_BASE.forEach((platoBase) => {
        const existe =
            platos.some((plato) => {
                return String(plato.id) === String(platoBase.id);
            });

        if (!existe) {
            platos.push({
                ...platoBase,
                fechaRegistro: new Date().toLocaleDateString()
            });

            huboCambios =
                true;
        }
    });

    if (huboCambios) {
        guardarPlatosRegistrados(platos);
    }
}


// =====================
// CARRITO
// =====================

function buscarRestaurantePorNombre(nombreRestaurante) {
    const nombreNormalizado =
        normalizarTexto(nombreRestaurante);

    const restaurante =
        obtenerRestaurantesRegistrados()
            .find((item) => {
                return normalizarTexto(item.nombre) === nombreNormalizado;
            });

    if (restaurante) {
        return {
            id: restaurante.id,
            ownerEmail: restaurante.ownerEmail,
            restauranteNombre: restaurante.nombre
        };
    }

    return {
        id: "rest_foodfinder",
        ownerEmail: "foodfinder@demo.local",
        restauranteNombre: nombreRestaurante || "FoodFinder"
    };
}

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
        carrito[index].cantidad =
            Number(carrito[index].cantidad || 1) + 1;
    } else {
        carrito.push(productoNuevo);
    }

    guardarCarrito(carrito);
}

function obtenerProductoDesdeTarjeta(boton) {
    const tarjeta =
        boton.closest(".plate-card");

    if (!tarjeta) {
        return null;
    }

    const nombreElemento =
        tarjeta.querySelector("h4");

    const precioElemento =
        tarjeta.querySelector(".price");

    const restauranteElemento =
        tarjeta.querySelector(".plate-resto");

    if (!nombreElemento || !precioElemento) {
        return null;
    }

    const nombre =
        nombreElemento.textContent.trim();

    const precio =
        parseFloat(
            precioElemento.textContent.replace(/[^0-9.]/g, "")
        );

    const imgElement =
        tarjeta.querySelector("img");

    const imagen =
        imgElement ? imgElement.src : "";

    const nombreRestaurante =
        restauranteElemento
            ? restauranteElemento.textContent.trim()
            : "FoodFinder";

    const restaurante =
        buscarRestaurantePorNombre(nombreRestaurante);

    const plato =
        obtenerPlatosRegistrados()
            .find((item) => {
                return (
                    normalizarTexto(item.nombre) === normalizarTexto(nombre) &&
                    item.restauranteId === restaurante.id
                );
            });

    return {
        platoId: plato ? plato.id : "",
        nombre,
        precio,
        imagen,
        cantidad: 1,
        restauranteId: restaurante.id,
        ownerEmail: restaurante.ownerEmail,
        restauranteNombre: restaurante.restauranteNombre
    };
}

function configurarBotonesAgregar() {
    const botonesAgregar =
        document.querySelectorAll(".btn-add");

    botonesAgregar.forEach((boton) => {
        if (boton.dataset.configurado === "true") {
            return;
        }

        boton.dataset.configurado =
            "true";

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

            boton.textContent =
                "✓";

            boton.style.backgroundColor =
                "#4CAF50";

            setTimeout(() => {
                boton.textContent =
                    textoOriginal;

                boton.style.backgroundColor =
                    "";
            }, 1000);
        });
    });
}


// =====================
// NAVEGACIÓN HOME
// =====================

function configurarLogoHome() {
    const logo =
        document.querySelector(".logo-completo-consumidor");

    if (!logo) {
        return;
    }

    logo.style.cursor =
        "pointer";

    logo.addEventListener("click", () => {
        window.location.href =
            "home.html";
    });
}

function configurarBotonesVerCarta() {
    const grid =
        document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    if (grid.dataset.listenerVerCarta === "true") {
        return;
    }

    grid.dataset.listenerVerCarta =
        "true";

    grid.addEventListener("click", (e) => {
        const boton =
            e.target.closest(".btn-ver-carta");

        if (!boton) {
            return;
        }

        const card =
            boton.closest(".resto-card");

        const restauranteId =
            card ? card.dataset.restauranteId : "";

        if (!restauranteId) {
            alert("No se encontró el restaurante seleccionado.");
            return;
        }

        window.location.href =
            "restaurantes.html?id=" + encodeURIComponent(restauranteId);
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

    iconoPerfil.style.cursor =
        "pointer";

    iconoPerfil.addEventListener("click", () => {
        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";
    });
}


// =====================
// VISIBILIDAD HOME
// =====================

let mostrarTodosRestaurantes =
    false;

let textoBusquedaHome =
    "";

let categoriaActivaHome =
    "todo";

function cardCoincideConBusqueda(card) {
    if (!textoBusquedaHome) {
        return true;
    }

    return normalizarTexto(card.textContent)
        .includes(textoBusquedaHome);
}

function cardCoincideConCategoria(card) {
    if (
        !categoriaActivaHome ||
        categoriaActivaHome.includes("todo")
    ) {
        return true;
    }

    return normalizarTexto(card.textContent)
        .includes(categoriaActivaHome);
}

function actualizarBotonVerMas(totalRestaurantesVisibles) {
    const btnVerMas =
        document.getElementById("btn-ver-mas-restaurantes");

    if (!btnVerMas) {
        return;
    }

    if (totalRestaurantesVisibles <= 3) {
        btnVerMas.style.display =
            "none";

        return;
    }

    btnVerMas.style.display =
        "";

    btnVerMas.textContent =
        mostrarTodosRestaurantes
            ? "Ver menos ↑"
            : "Ver más →";
}

function actualizarVisibilidadHome() {
    const restaurantes =
        document.querySelectorAll(".restaurant-grid .resto-card");

    const platos =
        document.querySelectorAll(".plates-grid .plate-card");

    const restaurantesCoincidentes =
        [];

    restaurantes.forEach((card) => {
        const visible =
            cardCoincideConBusqueda(card) &&
            cardCoincideConCategoria(card);

        if (visible) {
            restaurantesCoincidentes.push(card);
        }

        card.style.display =
            "none";
    });

    restaurantesCoincidentes.forEach((card, index) => {
        if (!mostrarTodosRestaurantes && index >= 3) {
            card.style.display =
                "none";
        } else {
            card.style.display =
                "";
        }
    });

    platos.forEach((card) => {
        const visible =
            cardCoincideConBusqueda(card) &&
            cardCoincideConCategoria(card);

        card.style.display =
            visible ? "" : "none";
    });

    actualizarBotonVerMas(
        restaurantesCoincidentes.length
    );
}

function configurarBuscadorHome() {
    const buscador =
        document.querySelector(".search-bar");

    if (!buscador) {
        return;
    }

    buscador.addEventListener("input", () => {
        textoBusquedaHome =
            normalizarTexto(buscador.value);

        actualizarVisibilidadHome();
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

            categoriaActivaHome =
                obtenerTextoCategoria(categoria);

            actualizarVisibilidadHome();
        });
    });
}

function configurarBotonVerMasRestaurantes() {
    const btnVerMas =
        document.getElementById("btn-ver-mas-restaurantes");

    if (!btnVerMas) {
        return;
    }

    btnVerMas.addEventListener("click", () => {
        mostrarTodosRestaurantes =
            !mostrarTodosRestaurantes;

        actualizarVisibilidadHome();
    });
}


// =====================
// RESTAURANTES DINÁMICOS
// =====================

function crearCardRestaurante(restaurante) {
    const imagen =
        restaurante.imagen ||
        "../../../Assests/Img/El rincon del sabor.jpg";

    const nombre =
        restaurante.nombre ||
        "Restaurante FoodFinder";

    const cocina =
        restaurante.cocina ||
        "Emprendimiento gastronómico";

    const direccion =
        restaurante.direccion ||
        restaurante.distrito ||
        "Lima, Perú";

    const descripcion =
        restaurante.descripcion ||
        "Restaurante registrado en FoodFinder.";

    const horario =
        restaurante.horario ||
        "Horario no registrado";

    const telefono =
        restaurante.telefono ||
        "Teléfono no registrado";

    const rating =
        obtenerRatingRestaurante(restaurante);

    const reviews =
        obtenerCantidadResenasRestaurante(restaurante);

    const article =
        document.createElement("article");

    article.classList.add("resto-card");

    article.dataset.restauranteId =
        restaurante.id;

    article.dataset.dinamico =
        "true";

    article.innerHTML = `
        <div class="resto-img-wrapper">
            <img
                src="${escaparHTML(imagen)}"
                alt="${escaparHTML(nombre)}">

            <span class="badge-open">
                <span class="dot"></span>
                ${escaparHTML(restaurante.estado || "Abierto")}
            </span>
        </div>

        <div class="resto-info">
            <h3>${escaparHTML(nombre)}</h3>

            <p class="cuisine">
                ${escaparHTML(cocina)}
            </p>

            <div class="resto-meta">
                <span class="star">★ ${escaparHTML(rating)}</span>
                <span class="reviews">(${escaparHTML(reviews)})</span>
            </div>

            <div class="tags">
                <span class="tag">${escaparHTML(direccion)}</span>
                <span class="tag">${escaparHTML(horario)}</span>
                <span class="tag">${escaparHTML(telefono)}</span>
            </div>

            <p class="restaurant-description">
                ${escaparHTML(descripcion)}
            </p>
        </div>

        <div class="resto-footer" style="justify-content: flex-end;">
            <button
                type="button"
                class="btn-ver-carta">
                Ver carta →
            </button>
        </div>
    `;

    return article;
}

function limpiarCardsRestaurantes() {
    const grid =
        document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        "";
}

function cargarRestaurantesDinamicosEnHome() {
    const grid =
        document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    limpiarCardsRestaurantes();

    const restaurantes =
        obtenerRestaurantesRegistrados();

    restaurantes.forEach((restaurante) => {
        const card =
            crearCardRestaurante(restaurante);

        grid.appendChild(card);
    });

    actualizarVisibilidadHome();
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

    inicializarRestaurantesBase();
    inicializarPlatosBase();

    configurarLogoHome();
    configurarBotonFiltros();
    configurarBuscadorHome();
    configurarCategoriasHome();
    configurarBotonesAgregar();
    configurarPerfilHome();
    configurarBotonVerMasRestaurantes();
    configurarBotonesVerCarta();

    cargarRestaurantesDinamicosEnHome();
    actualizarVisibilidadHome();
});