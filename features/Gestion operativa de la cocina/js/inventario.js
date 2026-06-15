// ==========================================
// inventario.js
// Épica 4 - Gestión de Inventario
// FoodFinder
// ==========================================

// Esperamos que cargue toda la página
document.addEventListener("DOMContentLoaded", function () {

    //----------------------------------------
    // CLAVE DEL LOCALSTORAGE
    //----------------------------------------

    var CLAVE_STORAGE = "inventario_foodfinder";

    //----------------------------------------
    // OBTENEMOS ELEMENTOS DEL HTML
    //----------------------------------------

    var tbodyInventario = document.getElementById("tbodyInventario");

    var buscador = document.getElementById("buscadorInventario");

    var btnAgregar = document.getElementById("btnAgregarInsumo");

    var totalInsumos = document.getElementById("totalInsumos");
    var stockOk = document.getElementById("stockOk");
    var stockBajo = document.getElementById("stockBajo");
    var stockAgotado = document.getElementById("stockAgotado");

    //----------------------------------------
    // ARREGLO PRINCIPAL
    //----------------------------------------

    var inventario = [];

    //----------------------------------------
    // FUNCIÓN:
    // Guardar en localStorage
    //----------------------------------------

    function guardarInventario() {

        localStorage.setItem(
            CLAVE_STORAGE,
            JSON.stringify(inventario)
        );

    }

    //----------------------------------------
    // FUNCIÓN:
    // Leer localStorage
    //----------------------------------------

    function cargarInventario() {

        var datos = localStorage.getItem(CLAVE_STORAGE);

        if (datos !== null) {

            inventario = JSON.parse(datos);

        } else {

            leerTablaInicial();

        }

    }

    //----------------------------------------
    // FUNCIÓN:
    // Leer la tabla HTML inicial
    //----------------------------------------

    function leerTablaInicial() {

        inventario = [];

        var filas = tbodyInventario.querySelectorAll("tr");

        filas.forEach(function (fila, indice) {

            var columnas = fila.querySelectorAll("td");

            var nombre =
                columnas[0]
                .innerText
                .replace(/\n/g, "")
                .trim();

            var categoria =
                columnas[1]
                .innerText
                .trim();

            var cantidadTexto =
                columnas[2]
                .innerText
                .trim();

            var cantidad =
                parseInt(cantidadTexto);

            var unidad =
                cantidadTexto
                .replace(cantidad, "")
                .trim();

            var estado =
                columnas[3]
                .innerText
                .trim();

            inventario.push({

                id: indice + 1,

                nombre: nombre,

                categoria: categoria,

                cantidad: cantidad,

                unidad: unidad,

                estado: estado

            });

        });

        guardarInventario();

    }

        //----------------------------------------
    // FUNCIÓN:
    // Determinar estado automáticamente
    //----------------------------------------

    function obtenerEstado(cantidad) {

        if (cantidad <= 0) {
            return "Agotado";
        }

        if (cantidad <= 5) {
            return "Stock bajo";
        }

        return "Disponible";

    }

    //----------------------------------------
    // FUNCIÓN:
    // Actualizar tarjetas superiores
    //----------------------------------------

    function actualizarResumen() {

        var disponibles = 0;
        var bajos = 0;
        var agotados = 0;

        for (var i = 0; i < inventario.length; i++) {

            var estado = obtenerEstado(inventario[i].cantidad);

            if (estado == "Disponible") {
                disponibles++;
            }

            else if (estado == "Stock bajo") {
                bajos++;
            }

            else {
                agotados++;
            }

        }

        totalInsumos.textContent = inventario.length;
        stockOk.textContent = disponibles;
        stockBajo.textContent = bajos;
        stockAgotado.textContent = agotados;

    }

    //----------------------------------------
    // FUNCIÓN:
    // Renderizar tabla
    //----------------------------------------

    function renderizarTabla(lista) {

        tbodyInventario.innerHTML = "";

        lista.forEach(function(insumo){

            var estado = obtenerEstado(insumo.cantidad);

            var claseBadge = "";
            var claseCantidad = "";

            if (estado == "Disponible") {

                claseBadge = "badge_disponible";
                claseCantidad = "cantidad_normal";

            }

            else if (estado == "Stock bajo") {

                claseBadge = "badge_stock_bajo";
                claseCantidad = "cantidad_amarillo";

            }

            else {

                claseBadge = "badge_agotado";
                claseCantidad = "cantidad_rojo";

            }

            var fila = document.createElement("tr");

            fila.className = "tabla_fila";

            fila.innerHTML =

            "<td class='tabla_td tabla_insumo'>" +

            "<span class='insumo_icono'>📦</span>" +

            insumo.nombre +

            "</td>" +

            "<td class='tabla_td'>" +

            insumo.categoria +

            "</td>" +

            "<td class='tabla_td'>" +

            "<span class='" + claseCantidad + "'>" +

            insumo.cantidad +

            "</span> " +

            insumo.unidad +

            "</td>" +

            "<td class='tabla_td'>" +

            "<span class='" + claseBadge + "'>" +

            estado +

            "</span>" +

            "</td>" +

            "<td class='tabla_td tabla_acciones'>" +

            "<button class='btn_editar' data-id='" +

            insumo.id +

            "'>✎ Editar</button>" +

            "<button class='btn_eliminar' data-id='" +

            insumo.id +

            "'>🗑</button>" +

            "</td>";

            tbodyInventario.appendChild(fila);

        });

        actualizarResumen();

    }

    //----------------------------------------
    // Cargar inventario inicial
    //----------------------------------------

    cargarInventario();

    renderizarTabla(inventario);

    //----------------------------------------
    // FILTRO ACTUAL
    //----------------------------------------

    var estadoActual = "Todos";

    //----------------------------------------
    // FUNCIÓN:
    // Aplicar búsqueda y filtros
    //----------------------------------------

    function aplicarFiltros() {

        var textoBusqueda = buscador.value.toLowerCase();

        var resultado = inventario.filter(function(insumo){

            // Buscar por nombre
            var coincideBusqueda =
                insumo.nombre.toLowerCase().includes(textoBusqueda);

            // Obtener estado actual
            var estado = obtenerEstado(insumo.cantidad);

            // Filtrar por estado
            var coincideEstado = false;

            if (estadoActual == "Todos") {

                coincideEstado = true;

            }

            else if (
                estadoActual == "Disponible" &&
                estado == "Disponible"
            ) {

                coincideEstado = true;

            }

            else if (
                estadoActual == "Stock bajo" &&
                estado == "Stock bajo"
            ) {

                coincideEstado = true;

            }

            else if (
                estadoActual == "Agotado" &&
                estado == "Agotado"
            ) {

                coincideEstado = true;

            }

            return coincideBusqueda && coincideEstado;

        });

        renderizarTabla(resultado);

    }

    //----------------------------------------
    // BUSCADOR
    //----------------------------------------

    buscador.addEventListener("input", function(){

        aplicarFiltros();

    });

    //----------------------------------------
    // BOTONES DE FILTRO
    //----------------------------------------

    var btnTodos =
        document.getElementById("filtroTodos");

    var btnDisponible =
        document.getElementById("filtroDisponible");

    var btnStockBajo =
        document.getElementById("filtroStockBajo");

    var btnAgotado =
        document.getElementById("filtroAgotado");

    //----------------------------------------
    // QUITAR BOTÓN ACTIVO
    //----------------------------------------

    function limpiarBotones(){

        btnTodos.classList.remove("filtro_estado_activo");

        btnDisponible.classList.remove("filtro_estado_activo");

        btnStockBajo.classList.remove("filtro_estado_activo");

        btnAgotado.classList.remove("filtro_estado_activo");

    }

    //----------------------------------------
    // EVENTOS DE FILTROS
    //----------------------------------------

    btnTodos.addEventListener("click", function(){

        estadoActual = "Todos";

        limpiarBotones();

        this.classList.add("filtro_estado_activo");

        aplicarFiltros();

    });

    btnDisponible.addEventListener("click", function(){

        estadoActual = "Disponible";

        limpiarBotones();

        this.classList.add("filtro_estado_activo");

        aplicarFiltros();

    });

    btnStockBajo.addEventListener("click", function(){

        estadoActual = "Stock bajo";

        limpiarBotones();

        this.classList.add("filtro_estado_activo");

        aplicarFiltros();

    });

    btnAgotado.addEventListener("click", function(){

        estadoActual = "Agotado";

        limpiarBotones();

        this.classList.add("filtro_estado_activo");

        aplicarFiltros();

    });

        //----------------------------------------
    // BOTÓN AGREGAR INSUMO
    //----------------------------------------

    btnAgregar.addEventListener("click", function () {

        // Solicitar nombre

        var nombre = prompt("Ingrese el nombre del insumo:");

        if (nombre === null || nombre.trim() === "") {

            alert("Debe ingresar un nombre.");

            return;

        }

        //----------------------------------------

        // Solicitar categoría

        var categoria = prompt(
            "Ingrese la categoría:\n\n" +
            "Ejemplo:\n" +
            "- Carnes y Pescados\n" +
            "- Tubérculos\n" +
            "- Verduras y Hierbas\n" +
            "- Lácteos y Derivados"
        );

        if (categoria === null || categoria.trim() === "") {

            alert("Debe ingresar una categoría.");

            return;

        }

        //----------------------------------------

        // Solicitar cantidad

        var cantidad = prompt("Ingrese la cantidad:");

        if (cantidad === null) {

            return;

        }

        cantidad = parseInt(cantidad);

        if (isNaN(cantidad) || cantidad < 0) {

            alert("Cantidad inválida.");

            return;

        }

        //----------------------------------------

        // Solicitar unidad

        var unidad = prompt(
            "Ingrese la unidad:\n\nEjemplo:\nkg\nlt\nunid"
        );

        if (unidad === null || unidad.trim() === "") {

            unidad = "unid";

        }

        //----------------------------------------

        // Calcular nuevo ID

        var nuevoId = 1;

        if (inventario.length > 0) {

            nuevoId =
                inventario[inventario.length - 1].id + 1;

        }

        //----------------------------------------

        // Crear nuevo objeto

        var nuevoInsumo = {

            id: nuevoId,

            nombre: nombre.trim(),

            categoria: categoria.trim(),

            cantidad: cantidad,

            unidad: unidad.trim(),

            estado: obtenerEstado(cantidad)

        };

        //----------------------------------------

        // Agregar al arreglo

        inventario.push(nuevoInsumo);

        //----------------------------------------

        // Guardar

        guardarInventario();

        //----------------------------------------

        // Actualizar tabla

        aplicarFiltros();

        //----------------------------------------

        alert("Insumo agregado correctamente.");

    });

        //----------------------------------------
    // ELIMINAR INSUMO
    //----------------------------------------

    function eliminarInsumo(id) {

        var confirmar = confirm(
            "¿Seguro que deseas eliminar este insumo?"
        );

        if (!confirmar) {
            return;
        }

        // Filtrar el inventario eliminando el ID
        inventario = inventario.filter(function(insumo){
            return insumo.id != id;
        });

        guardarInventario();
        aplicarFiltros();

    }

    //----------------------------------------
    // EDITAR INSUMO (solo cantidad)
    //----------------------------------------

    function editarInsumo(id) {

        var nuevoValor = prompt(
            "Ingrese la nueva cantidad:"
        );

        if (nuevoValor === null) {
            return;
        }

        nuevoValor = parseInt(nuevoValor);

        if (isNaN(nuevoValor) || nuevoValor < 0) {

            alert("Cantidad inválida");
            return;

        }

        // Buscar el insumo
        for (var i = 0; i < inventario.length; i++) {

            if (inventario[i].id == id) {

                inventario[i].cantidad = nuevoValor;

                // actualizar estado automáticamente
                inventario[i].estado =
                    obtenerEstado(nuevoValor);

                break;

            }

        }

        guardarInventario();
        aplicarFiltros();

    }

    //----------------------------------------
    // CLICK EN BOTONES (delegación de eventos)
    //----------------------------------------

    tbodyInventario.addEventListener("click", function (e) {

        var target = e.target;

        //------------------------------------
        // BOTÓN ELIMINAR
        //------------------------------------

        if (target.classList.contains("btn_eliminar")) {

            var id = parseInt(target.getAttribute("data-id"));

            eliminarInsumo(id);

        }

        //------------------------------------
        // BOTÓN EDITAR
        //------------------------------------

        if (target.classList.contains("btn_editar")) {

            var id = parseInt(target.getAttribute("data-id"));

            editarInsumo(id);

        }

    });

        //----------------------------------------
    // RE-RENDER GLOBAL (UTILIDAD FINAL)
    //----------------------------------------
    // Esta función sirve para volver a pintar todo
    // desde el estado actual del inventario
    //----------------------------------------

    function refrescarTodo() {

        aplicarFiltros();

        actualizarResumen();

        guardarInventario();

    }

    //----------------------------------------
    // INICIALIZACIÓN FINAL SEGURA
    //----------------------------------------

    function inicializarInventario() {

        cargarInventario();

        renderizarTabla(inventario);

        actualizarResumen();

    }

    //----------------------------------------
    // LLAMADA INICIAL
    //----------------------------------------

    inicializarInventario();

});
