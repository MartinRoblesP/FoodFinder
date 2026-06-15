// ==========================================
// configuracion.js (MEJORADO)
// Épica 4 - Configuración del restaurante
// UX mejorado + localStorage + validaciones
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ============================
    // ELEMENTOS
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

    // ============================
    // SISTEMA DE MENSAJES (UI)
    // ============================
    function mostrarMensaje(texto, tipo) {

        var msg = document.createElement("div");
        msg.textContent = texto;

        msg.className = "msg_toast " + (tipo === "error" ? "msg_error" : "msg_success");

        document.body.appendChild(msg);

        setTimeout(function () {
            msg.classList.add("msg_show");
        }, 10);

        setTimeout(function () {
            msg.classList.remove("msg_show");

            setTimeout(function () {
                msg.remove();
            }, 300);

        }, 2500);
    }

    // ============================
    // CARGAR CONFIGURACIÓN
    // ============================
    var datosGuardados = localStorage.getItem("configuracion_restaurante");

    if (datosGuardados) {
        var datos = JSON.parse(datosGuardados);

        nombre.value = datos.nombre || "";
        descripcion.value = datos.descripcion || "";
        telefono.value = datos.telefono || "";
    }

    // ============================
    // CARGAR HORARIOS
    // ============================
    var horariosGuardados = localStorage.getItem("horarios_restaurante");

    if (horariosGuardados) {

        var d = JSON.parse(horariosGuardados);

        horarios[0].value = d.lv_inicio;
        horarios[1].value = d.lv_fin;

        horarios[2].value = d.sab_inicio;
        horarios[3].value = d.sab_fin;

        horarios[4].value = d.dom_inicio;
        horarios[5].value = d.dom_fin;

        toggleLV.checked = d.lv_cerrado;
        toggleSab.checked = d.sab_cerrado;
        toggleDom.checked = d.dom_cerrado;
    }

    // ============================
    // GUARDAR INFO RESTAURANTE
    // ============================
    guardarDatos.addEventListener("click", function () {

        if (nombre.value.trim() === "") {
            mostrarMensaje("El nombre del restaurante es obligatorio", "error");
            return;
        }

        var info = {
            nombre: nombre.value,
            descripcion: descripcion.value,
            telefono: telefono.value
        };

        localStorage.setItem("configuracion_restaurante", JSON.stringify(info));

        mostrarMensaje("Información guardada correctamente", "success");
    });

    // ============================
    // GUARDAR HORARIOS
    // ============================
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

        localStorage.setItem("horarios_restaurante", JSON.stringify(horario));

        mostrarMensaje("Horarios actualizados correctamente", "success");
    });

    // ============================
    // DESHABILITAR HORARIOS
    // ============================
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