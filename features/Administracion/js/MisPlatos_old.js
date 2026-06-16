document.addEventListener("DOMContentLoaded", function () {
    const fondoCard = document.querySelector(".fondo_card");
    const btnAgregar = document.getElementById("btn_Agregar");
    const contenedorPlatos = document.getElementById("contenedor-platos");

    const btnSubmitPlato = document.querySelector('.datos_plato button[type="submit"]');
    const btnCancelar = document.querySelector('.datos_plato button[type="button"], .datos_plato button[type="cancelar"]');

    const inputNombre = document.getElementById("nombre");
    const inputPrecio = document.getElementById("Precio");
    const inputStock = document.getElementById("Stock");
    const inputDescripcion = document.getElementById("Descripcion");
    const inputFoto = document.getElementById("foto-plato");
    const plusIcon = document.getElementById("plus-icon");

    let filaEditando = null;

    fondoCard.style.display = "none";

    // CORREGIDO: Guarda fielmente cada propiedad en el LocalStorage
    function guardarLocalStorage() {
        const platos = [];

        document.querySelectorAll("#contenedor-platos tr").forEach(function (fila) {
            const celdas = fila.children;
            if (celdas.length >= 5) {
                platos.push({
                    nombre: celdas[0].textContent.trim(),
                    precio: celdas[1].textContent.replace("S/ ", "").trim(),
                    stock: celdas[2].textContent.trim(),
                    descripcion: fila.dataset.descripcion || "",
                    pedidos: celdas[4].textContent.trim() || "0"
                });
            }
        });

        localStorage.setItem("platos", JSON.stringify(platos));
    }

    function cargarLocalStorage() {
        const platos = JSON.parse(localStorage.getItem("platos")) || [];

        platos.forEach(function (plato) {
            const nuevaFila = document.createElement("tr");
            nuevaFila.dataset.descripcion = plato.descripcion || "";

            nuevaFila.innerHTML = `
                <td>${plato.nombre}</td>
                <td>S/ ${parseFloat(plato.precio).toFixed(2)}</td>
                <td>${plato.stock}</td>
                <td></td>
                <td>${plato.pedidos || 0}</td>
                <td>
                    <div class="acciones-celda">
                        <button class="btn-editar">✏️ Editar</button>
                        <button class="btn-eliminar">🗑️</button>
                    </div>
                </td>
            `;

            actualizarEstado(nuevaFila.children[3], parseInt(plato.stock) || 0);
            contenedorPlatos.appendChild(nuevaFila);
        });
    }

    function limpiarFormulario() {
        inputNombre.value = "";
        inputPrecio.value = "";
        inputStock.value = "";
        inputDescripcion.value = "";
        inputFoto.value = "";

        inputNombre.classList.remove("campo-error");
        inputPrecio.classList.remove("campo-error");
        inputStock.classList.remove("campo-error");
        inputDescripcion.classList.remove("campo-error");
        plusIcon.classList.remove("campo-error");

        filaEditando = null;
        btnSubmitPlato.textContent = "Añadir";
    }

    function actualizarEstado(tdEstado, stockNumero) {
        tdEstado.innerHTML = "";

        const spanEstado = document.createElement("span");
        spanEstado.classList.add("badge");

        if (stockNumero <= 0) {
            spanEstado.classList.add("sin-stock");
            spanEstado.textContent = "Sin stock";
        } else {
            spanEstado.classList.add("con-stock");
            spanEstado.textContent = "Con stock";
        }

        tdEstado.appendChild(spanEstado);
    }

    cargarLocalStorage();

    btnAgregar.addEventListener("click", function () {
        limpiarFormulario();
        fondoCard.style.display = "flex";
    });

    btnCancelar.addEventListener("click", function (event) {
        event.preventDefault();
        fondoCard.style.display = "none";
        limpiarFormulario();
    });

    // Quitar borde rojo dinámicamente mientras el usuario escribe
    [inputNombre, inputPrecio, inputStock, inputDescripcion].forEach(function (input) {
        input.addEventListener("input", function () {
            input.classList.remove("campo-error");
        });
    });

    inputFoto.addEventListener("change", function () {
        plusIcon.classList.remove("campo-error");

        if (inputFoto.files.length > 0) {
            const archivo = inputFoto.files[0];

            if (archivo.type !== "image/png") {
                plusIcon.classList.add("campo-error");
                alert("Solo se admiten imágenes PNG");
                inputFoto.value = "";
            }
        }
    });

    btnSubmitPlato.addEventListener("click", function (event) {
        event.preventDefault();

        const nombre = inputNombre.value.trim();
        const precio = inputPrecio.value.trim();
        const stock = inputStock.value.trim();
        const descripcion = inputDescripcion.value.trim();

        let formularioValido = true;

        // Validaciones rigurosas agregando la clase de error
        if (nombre === "") {
            inputNombre.classList.add("campo-error");
            formularioValido = false;
        }

        if (precio === "" || parseFloat(precio) < 0) {
            inputPrecio.classList.add("campo-error");
            formularioValido = false;
        }

        if (stock === "" || parseInt(stock) < 0) {
            inputStock.classList.add("campo-error");
            formularioValido = false;
        }

        if (descripcion === "") {
            inputDescripcion.classList.add("campo-error");
            formularioValido = false;
        }

        if (filaEditando === null && inputFoto.files.length === 0) {
            plusIcon.classList.add("campo-error");
            formularioValido = false;
        }

        if (!formularioValido) {
            alert("Por favor, complete correctamente todos los campos marcados.");
            return;
        }

        const stockNumero = parseInt(stock) || 0;
        const precioNumero = parseFloat(precio) || 0;

        if (filaEditando !== null) {
            // Modo Edición
            const celdas = filaEditando.children;

            celdas[0].textContent = nombre;
            celdas[1].textContent = "S/ " + precioNumero.toFixed(2);
            celdas[2].textContent = stockNumero;

            actualizarEstado(celdas[3], stockNumero);
            filaEditando.dataset.descripcion = descripcion;

            guardarLocalStorage();

            fondoCard.style.display = "none";
            limpiarFormulario();
            return;
        }

        // Modo Creación (Nuevo Plato)
        const nuevaFila = document.createElement("tr");
        nuevaFila.dataset.descripcion = descripcion;

        nuevaFila.innerHTML = `
            <td>${nombre}</td>
            <td>S/ ${precioNumero.toFixed(2)}</td>
            <td>${stockNumero}</td>
            <td></td>
            <td>0</td>
            <td>
                <div class="acciones-celda">
                    <button class="btn-editar">✏️ Editar</button>
                    <button class="btn-eliminar">🗑️</button>
                </div>
            </td>
        `;

        actualizarEstado(nuevaFila.children[3], stockNumero);
        contenedorPlatos.appendChild(nuevaFila);
        
        guardarLocalStorage(); // Guarda de inmediato los cambios del nuevo elemento

        fondoCard.style.display = "none";
        limpiarFormulario();
    });

    // Delegación de eventos para botones de la tabla
    contenedorPlatos.addEventListener("click", function (event) {
        if (event.target.classList.contains("btn-eliminar")) {
            if(confirm("¿Está seguro de que desea eliminar este plato?")) {
                const fila = event.target.closest("tr");
                fila.remove();
                guardarLocalStorage();
            }
        }

        if (event.target.classList.contains("btn-editar")) {
            filaEditando = event.target.closest("tr");
            const celdas = filaEditando.children;

            inputNombre.value = celdas[0].textContent;
            inputPrecio.value = celdas[1].textContent.replace("S/ ", "");
            inputStock.value = celdas[2].textContent;
            inputDescripcion.value = filaEditando.dataset.descripcion || "";

            inputFoto.value = "";
            btnSubmitPlato.textContent = "Guardar";

            fondoCard.style.display = "flex";
        }
    });
});