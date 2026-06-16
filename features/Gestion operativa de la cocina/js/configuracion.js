document.addEventListener("DOMContentLoaded", function () {

    /* ── Claves de localStorage ── */
    var CLAVE_INFO     = "config_info_restaurante";
    var CLAVE_HORARIOS = "config_horarios";

    /* ── Referencias DOM ── */
    var inputNombre      = document.getElementById("nombre-restaurante");
    var inputDescripcion = document.getElementById("descripcion");
    var inputTelefono    = document.getElementById("telefono");
    var btnGuardarInfo   = document.getElementById("btn-guardar-info");
    var btnActualizar    = document.getElementById("btn-actualizar-horarios");
    var btnFoto          = document.getElementById("btn-foto");
    var btnLogo          = document.getElementById("btn-logo");
    var inputFoto        = document.getElementById("input-foto");
    var inputLogo        = document.getElementById("input-logo");
    var toast            = document.getElementById("toast");

    var horarios = [
        {
            toggle: document.getElementById("toggle-lv"),
            inicio: document.getElementById("lv-inicio"),
            fin:    document.getElementById("lv-fin")
        },
        {
            toggle: document.getElementById("toggle-sa"),
            inicio: document.getElementById("sa-inicio"),
            fin:    document.getElementById("sa-fin")
        },
        {
            toggle: document.getElementById("toggle-do"),
            inicio: document.getElementById("do-inicio"),
            fin:    document.getElementById("do-fin")
        }
    ];

    /* ── Toast helper ── */
    function mostrarToast(mensaje) {
        toast.textContent = mensaje;
        toast.classList.add("visible");
        setTimeout(function () {
            toast.classList.remove("visible");
        }, 2500);
    }

    /* ── Cargar info del restaurante desde localStorage ── */
    function cargarInfo() {
        var datos = JSON.parse(localStorage.getItem(CLAVE_INFO));
        if (datos) {
            inputNombre.value      = datos.nombre      || "";
            inputDescripcion.value = datos.descripcion || "";
            inputTelefono.value    = datos.telefono    || "";
        }
    }

    /* ── Guardar info del restaurante ── */
    btnGuardarInfo.addEventListener("click", function () {
        var nombre      = inputNombre.value.trim();
        var descripcion = inputDescripcion.value.trim();
        var telefono    = inputTelefono.value.trim();

        inputNombre.classList.remove("campo-error");
        inputDescripcion.classList.remove("campo-error");
        inputTelefono.classList.remove("campo-error");

        var valido = true;

        if (nombre === "") {
            inputNombre.classList.add("campo-error");
            valido = false;
        }
        if (descripcion === "") {
            inputDescripcion.classList.add("campo-error");
            valido = false;
        }
        if (telefono === "") {
            inputTelefono.classList.add("campo-error");
            valido = false;
        }

        if (!valido) {
            mostrarToast("Por favor, completa todos los campos.");
            return;
        }

        localStorage.setItem(CLAVE_INFO, JSON.stringify({
            nombre:      nombre,
            descripcion: descripcion,
            telefono:    telefono
        }));

        mostrarToast("¡Información guardada correctamente!");
    });

    /* ── Limpiar error al escribir ── */
    [inputNombre, inputDescripcion, inputTelefono].forEach(function (el) {
        el.addEventListener("input", function () {
            el.classList.remove("campo-error");
        });
    });

    /* ── Botones adjuntar (abren el input file) ── */
    btnFoto.addEventListener("click", function () {
        inputFoto.click();
    });

    btnLogo.addEventListener("click", function () {
        inputLogo.click();
    });

    inputFoto.addEventListener("change", function () {
        if (inputFoto.files.length > 0) {
            btnFoto.textContent = inputFoto.files[0].name;
        }
    });

    inputLogo.addEventListener("change", function () {
        if (inputLogo.files.length > 0) {
            btnLogo.textContent = inputLogo.files[0].name;
        }
    });

    /* ── Toggle "Cerrado": deshabilita inputs de hora ── */
    function aplicarEstadoCerrado(item) {
        var cerrado      = item.toggle.checked;
        item.inicio.disabled = cerrado;
        item.fin.disabled    = cerrado;
    }

    horarios.forEach(function (item) {
        item.toggle.addEventListener("change", function () {
            aplicarEstadoCerrado(item);
        });
    });

    /* ── Cargar horarios guardados desde localStorage ── */
    function cargarHorarios() {
        var datos = JSON.parse(localStorage.getItem(CLAVE_HORARIOS));
        if (!datos) return;

        var claves = ["lv", "sa", "do"];
        claves.forEach(function (clave, i) {
            if (datos[clave]) {
                horarios[i].inicio.value   = datos[clave].inicio  || horarios[i].inicio.value;
                horarios[i].fin.value      = datos[clave].fin     || horarios[i].fin.value;
                horarios[i].toggle.checked = datos[clave].cerrado || false;
                aplicarEstadoCerrado(horarios[i]);
            }
        });
    }

    /* ── Guardar horarios ── */
    btnActualizar.addEventListener("click", function () {
        var datos = {
            lv: { inicio: horarios[0].inicio.value, fin: horarios[0].fin.value, cerrado: horarios[0].toggle.checked },
            sa: { inicio: horarios[1].inicio.value, fin: horarios[1].fin.value, cerrado: horarios[1].toggle.checked },
            do: { inicio: horarios[2].inicio.value, fin: horarios[2].fin.value, cerrado: horarios[2].toggle.checked }
        };

        localStorage.setItem(CLAVE_HORARIOS, JSON.stringify(datos));
        mostrarToast("¡Horarios actualizados correctamente!");
    });

    /* ── Inicializar ── */
    cargarInfo();
    cargarHorarios();

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
        document.getElementById("btnDashboard") ||
        document.getElementById("btn_Dashboard") ||
        document.getElementById("btn_dashboard");

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
