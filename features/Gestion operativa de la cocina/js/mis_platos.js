document.addEventListener("DOMContentLoaded", function () {

    //----------------------------------------
    // LOCALSTORAGE KEY
    //----------------------------------------

    var CLAVE_PLATOS = "platos_foodfinder";

    //----------------------------------------
    // ELEMENTOS DEL DOM
    //----------------------------------------

    var tbodyPlatos = document.querySelector(".tabla_dashboard tbody");

    var btnAgregarPlato = document.querySelector(".btn_agregar");

    //----------------------------------------
    // ARREGLO PRINCIPAL
    //----------------------------------------

    var platos = [];

    //----------------------------------------
    // ESTADO DEL PLATO
    //----------------------------------------

    function obtenerEstado(stock) {

        if (stock <= 0) {
            return "Agotado";
        }

        if (stock <= 3) {
            return "Stock bajo";
        }

        return "Con stock";

    }

    //----------------------------------------
    // GUARDAR EN LOCALSTORAGE
    //----------------------------------------

    function guardarPlatos() {

        localStorage.setItem(
            CLAVE_PLATOS,
            JSON.stringify(platos)
        );

    }

    //----------------------------------------
    // CARGAR DATOS
    //----------------------------------------

    function cargarPlatos() {

        var data = localStorage.getItem(CLAVE_PLATOS);

        if (data !== null) {

            platos = JSON.parse(data);

        } else {

            leerTablaInicial();

        }

    }

    //----------------------------------------
    // LEER HTML INICIAL
    //----------------------------------------

    function leerTablaInicial() {

        platos = [];

        var filas = tbodyPlatos.querySelectorAll("tr");

        filas.forEach(function (fila, index) {

            var celdas = fila.querySelectorAll("td");

            var nombre = celdas[0].innerText.trim();
            var precio = celdas[1].innerText.replace("S/", "").trim();
            var stock = parseInt(celdas[2].innerText.trim());

            platos.push({

                id: index + 1,
                nombre: nombre,
                precio: parseFloat(precio),
                stock: stock

            });

        });

        guardarPlatos();

    }

    //----------------------------------------
    // RENDER TABLA
    //----------------------------------------

    function renderPlatos(lista) {

        tbodyPlatos.innerHTML = "";

        lista.forEach(function (plato) {

            var estado = obtenerEstado(plato.stock);

            var badgeClass = "";

            if (estado === "Con stock") {
                badgeClass = "badge_con_stock";
            } else if (estado === "Stock bajo") {
                badgeClass = "badge_stock_bajo";
            } else {
                badgeClass = "badge_agotado";
            }

            var fila = document.createElement("tr");

            fila.className = "tabla_fila";

            fila.innerHTML =
                "<td class='tabla_td'>" + plato.nombre + "</td>" +
                "<td class='tabla_td'>S/ " + plato.precio + "</td>" +
                "<td class='tabla_td'>" + plato.stock + "</td>" +
                "<td class='tabla_td'><span class='" + badgeClass + "'>" + estado + "</span></td>" +
                "<td class='tabla_td'>" + Math.floor(Math.random() * 10) + "</td>" +
                "<td class='tabla_td tabla_acciones'>" +
                "<button class='btn_editar' data-id='" + plato.id + "'>✎ Editar</button>" +
                "<button class='btn_eliminar' data-id='" + plato.id + "'>🗑</button>" +
                "</td>";

            tbodyPlatos.appendChild(fila);

        });

    }

    //----------------------------------------
    // AGREGAR PLATO
    //----------------------------------------

    btnAgregarPlato.addEventListener("click", function () {

        var nombre = prompt("Nombre del plato:");

        if (!nombre) return;

        var precio = parseFloat(prompt("Precio del plato:"));

        if (isNaN(precio)) return;

        var stock = parseInt(prompt("Stock disponible:"));

        if (isNaN(stock)) return;

        var nuevoId = platos.length > 0
            ? platos[platos.length - 1].id + 1
            : 1;

        var nuevoPlato = {

            id: nuevoId,
            nombre: nombre,
            precio: precio,
            stock: stock

        };

        platos.push(nuevoPlato);

        guardarPlatos();
        renderPlatos(platos);

    });

    //----------------------------------------
    // EDITAR Y ELIMINAR (EVENT DELEGATION)
    //----------------------------------------

    tbodyPlatos.addEventListener("click", function (e) {

        var target = e.target;

        //------------------------------------
        // ELIMINAR
        //------------------------------------

        if (target.classList.contains("btn_eliminar")) {

            var id = parseInt(target.getAttribute("data-id"));

            platos = platos.filter(function (p) {
                return p.id !== id;
            });

            guardarPlatos();
            renderPlatos(platos);

        }

        //------------------------------------
        // EDITAR
        //------------------------------------

        if (target.classList.contains("btn_editar")) {

            var id = parseInt(target.getAttribute("data-id"));

            var plato = platos.find(function (p) {
                return p.id === id;
            });

            if (!plato) return;

            var nuevoPrecio = parseFloat(
                prompt("Nuevo precio:", plato.precio)
            );

            var nuevoStock = parseInt(
                prompt("Nuevo stock:", plato.stock)
            );

            if (!isNaN(nuevoPrecio)) {
                plato.precio = nuevoPrecio;
            }

            if (!isNaN(nuevoStock)) {
                plato.stock = nuevoStock;
            }

            guardarPlatos();
            renderPlatos(platos);

        }

    });

    //----------------------------------------
    // INICIALIZACIÓN
    //----------------------------------------

    function init() {

        cargarPlatos();
        renderPlatos(platos);

    }

    init();

});