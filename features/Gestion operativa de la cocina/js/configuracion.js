// ==========================================
// configuracion.js
// Épica 4
// Gestión de configuración del restaurante
// ==========================================

// Esperamos que toda la página cargue
document.addEventListener("DOMContentLoaded", function () {

    // ============================
    // OBTENER ELEMENTOS DEL HTML
    // ============================

    var nombre = document.querySelector("#nombre_restaurante");
    var descripcion = document.querySelector("#descripcion");
    var telefono = document.querySelector("#telefono");

    var guardarDatos = document.querySelectorAll(".btn_guardar")[0];
    var guardarHorarios = document.querySelectorAll(".btn_guardar")[1];

    var toggleLV = document.querySelector("#toggle_lv");
    var toggleSab = document.querySelector("#toggle_sab");
    var toggleDom = document.querySelector("#toggle_dom");

    var horarios = document.querySelectorAll(".horario_input");



    // ==================================
    // CARGAR DATOS GUARDADOS
    // ==================================

    var datosGuardados = localStorage.getItem("configuracion_restaurante");

    if (datosGuardados != null) {

        var datos = JSON.parse(datosGuardados);

        nombre.value = datos.nombre;
        descripcion.value = datos.descripcion;
        telefono.value = datos.telefono;

    }



    // ==================================
    // CARGAR HORARIOS
    // ==================================

    var horariosGuardados = localStorage.getItem("horarios_restaurante");

    if (horariosGuardados != null) {

        var datosHorario = JSON.parse(horariosGuardados);

        horarios[0].value = datosHorario.lv_inicio;
        horarios[1].value = datosHorario.lv_fin;

        horarios[2].value = datosHorario.sab_inicio;
        horarios[3].value = datosHorario.sab_fin;

        horarios[4].value = datosHorario.dom_inicio;
        horarios[5].value = datosHorario.dom_fin;

        toggleLV.checked = datosHorario.lv_cerrado;
        toggleSab.checked = datosHorario.sab_cerrado;
        toggleDom.checked = datosHorario.dom_cerrado;

    }



    // ==================================
    // GUARDAR INFORMACIÓN
    // ==================================

    guardarDatos.addEventListener("click", function () {

        if (nombre.value.trim() == "") {

            alert("Ingrese el nombre del restaurante.");

            return;

        }

        var informacion = {

            nombre: nombre.value,
            descripcion: descripcion.value,
            telefono: telefono.value

        };

        localStorage.setItem(

            "configuracion_restaurante",

            JSON.stringify(informacion)

        );

        alert("Información guardada correctamente.");

    });



    // ==================================
    // GUARDAR HORARIOS
    // ==================================

    guardarHorarios.addEventListener("click", function () {

        var horario = {

            lv_inicio: horarios[0].value,
            lv_fin: horarios[1].value,

            sab_inicio: horarios[2].value,
            sab_fin: horarios[3].value,

            dom_inicio: horarios[4].value,
            dom_fin: horarios[5].value,

            lv_cerrado: toggleLV.checked,
            sab_cerrado: toggleSab.checked,
            dom_cerrado: toggleDom.checked

        };

        localStorage.setItem(

            "horarios_restaurante",

            JSON.stringify(horario)

        );

        alert("Horarios actualizados correctamente.");

    });



    // ==================================
    // DESHABILITAR HORAS SI ESTÁ CERRADO
    // ==================================

    function actualizarEstado() {

        horarios[0].disabled = toggleLV.checked;
        horarios[1].disabled = toggleLV.checked;

        horarios[2].disabled = toggleSab.checked;
        horarios[3].disabled = toggleSab.checked;

        horarios[4].disabled = toggleDom.checked;
        horarios[5].disabled = toggleDom.checked;

    }



    toggleLV.addEventListener("change", actualizarEstado);

    toggleSab.addEventListener("change", actualizarEstado);

    toggleDom.addEventListener("change", actualizarEstado);



    actualizarEstado();

});