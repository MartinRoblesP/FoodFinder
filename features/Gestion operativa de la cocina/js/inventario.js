document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // ELEMENTOS
    // =========================
    const tbody = document.querySelector("#tbodyInventario");
    const btnAgregar = document.querySelector("#btnAgregarInsumo");
    const buscador = document.querySelector("#buscadorInventario");

    const filtroTodos = document.querySelector("#filtroTodos");
    const filtroDisponible = document.querySelector("#filtroDisponible");
    const filtroStockBajo = document.querySelector("#filtroStockBajo");
    const filtroAgotado = document.querySelector("#filtroAgotado");

    const filtrosCategoria = document.querySelectorAll(".filtro_categoria");

    const totalInsumos = document.querySelector("#totalInsumos");
    const stockOk = document.querySelector("#stockOk");
    const stockBajo = document.querySelector("#stockBajo");
    const stockAgotado = document.querySelector("#stockAgotado");

    // =========================
    // LOCAL STORAGE
    // =========================
    const KEY = "inventario_data";
    let inventario = [];

    let filtroEstado = "todos";
    let categoriaActual = "Todas";

    // =========================
    // CATEGORÍAS (IMPORTANTE)
    // =========================
    const categorias = [
        "Carnes y Pescados",
        "Tubérculos",
        "Verduras y Hierbas",
        "Aceites y Grasas",
        "Cereales y Granos",
        "Frutas",
        "Lácteos y Derivados"
    ];

    // =========================
    // DATA INICIAL
    // =========================
    const datosIniciales = [
        { id: 1, nombre: "Leche de Coco", categoria: "Lácteos y Derivados", cantidad: 0 },
        { id: 2, nombre: "Papa Amarilla", categoria: "Tubérculos", cantidad: 3 },
        { id: 3, nombre: "Ajo", categoria: "Verduras y Hierbas", cantidad: 1 },
        { id: 4, nombre: "Filete de Salmón", categoria: "Carnes y Pescados", cantidad: 15 },
        { id: 5, nombre: "Pechuga de Pollo", categoria: "Carnes y Pescados", cantidad: 8 }
    ];

    // =========================
    // INIT
    // =========================
    function cargar() {
        const data = localStorage.getItem(KEY);
        inventario = data ? JSON.parse(data) : datosIniciales;
        guardar();
    }

    function guardar() {
        localStorage.setItem(KEY, JSON.stringify(inventario));
    }

    // =========================
    // ESTADO
    // =========================
    function estado(item) {
        if (item.cantidad <= 0) return "agotado";
        if (item.cantidad <= 3) return "bajo";
        return "ok";
    }

    // =========================
    // RENDER
    // =========================
    function render(texto = "") {

        tbody.innerHTML = "";

        let data = inventario.filter(i => {

            const okTexto = i.nombre.toLowerCase().includes(texto.toLowerCase());

            const okCategoria =
                categoriaActual === "Todas" ||
                i.categoria === categoriaActual;

            const est = estado(i);

            let okEstado = true;

            if (filtroEstado === "disponible") okEstado = est === "ok";
            if (filtroEstado === "bajo") okEstado = est === "bajo";
            if (filtroEstado === "agotado") okEstado = est === "agotado";

            return okTexto && okCategoria && okEstado;
        });

        data.forEach(i => {

            const est = estado(i);

            let badge = "";
            let cantidadClass = "cantidad_normal";

            if (est === "ok") badge = `<span class="badge_disponible">✔ Disponible</span>`;
            if (est === "bajo") {
                badge = `<span class="badge_stock_bajo">⚠ Stock bajo</span>`;
                cantidadClass = "cantidad_amarillo";
            }
            if (est === "agotado") {
                badge = `<span class="badge_agotado">❌ Agotado</span>`;
                cantidadClass = "cantidad_rojo";
            }

            const row = document.createElement("tr");
            row.classList.add("tabla_fila");

            row.innerHTML = `
                <td class="tabla_td tabla_insumo">
                    <span class="insumo_icono">📦</span> ${i.nombre}
                </td>
                <td class="tabla_td">${i.categoria}</td>
                <td class="tabla_td"><span class="${cantidadClass}">${i.cantidad}</span></td>
                <td class="tabla_td">${badge}</td>
                <td class="tabla_td tabla_acciones">
                    <button class="btn_editar" data-id="${i.id}">✏ Editar</button>
                    <button class="btn_eliminar" data-id="${i.id}">🗑</button>
                </td>
            `;

            tbody.appendChild(row);
        });

        actualizarResumen();
        eventos();
    }

    // =========================
    // RESUMEN
    // =========================
    function actualizarResumen() {
        totalInsumos.textContent = inventario.length;
        stockOk.textContent = inventario.filter(i => estado(i) === "ok").length;
        stockBajo.textContent = inventario.filter(i => estado(i) === "bajo").length;
        stockAgotado.textContent = inventario.filter(i => estado(i) === "agotado").length;
    }

    // =========================
    // MODAL (AGREGAR / EDITAR)
    // =========================
    function modal(item = null) {

        const div = document.createElement("div");
        div.className = "modal_bg";

        let opciones = categorias.map(c =>
            `<option value="${c}" ${item?.categoria === c ? "selected" : ""}>${c}</option>`
        ).join("");

        div.innerHTML = `
            <div class="modal_box">
                <h3>${item ? "Editar insumo" : "Agregar insumo"}</h3>

                <input id="m_nombre" placeholder="Nombre" value="${item ? item.nombre : ""}">

                <select id="m_categoria">
                    <option disabled selected>Selecciona categoría</option>
                    ${opciones}
                </select>

                <input id="m_cantidad" type="number" placeholder="Cantidad" value="${item ? item.cantidad : ""}">

                <div class="modal_actions">
                    <button id="m_cancelar">Cancelar</button>
                    <button id="m_guardar">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(div);

        document.querySelector("#m_cancelar").onclick = () => div.remove();

        document.querySelector("#m_guardar").onclick = () => {

            const nombre = document.querySelector("#m_nombre").value;
            const categoria = document.querySelector("#m_categoria").value;
            const cantidad = parseInt(document.querySelector("#m_cantidad").value);

            if (!nombre || !categoria) return;

            if (item) {
                item.nombre = nombre;
                item.categoria = categoria;
                item.cantidad = cantidad;
            } else {
                inventario.push({
                    id: Date.now(),
                    nombre,
                    categoria,
                    cantidad
                });
            }

            guardar();
            div.remove();
            render();
        };
    }

    // =========================
    // EVENTOS TABLA
    // =========================
    function eventos() {

        document.querySelectorAll(".btn_eliminar").forEach(b => {
            b.onclick = () => {
                const id = Number(b.dataset.id);
                inventario = inventario.filter(i => i.id !== id);
                guardar();
                render(buscador.value);
            };
        });

        document.querySelectorAll(".btn_editar").forEach(b => {
            b.onclick = () => {
                const id = Number(b.dataset.id);
                const item = inventario.find(i => i.id === id);
                modal(item);
            };
        });
    }

    // =========================
    // FILTROS ESTADO
    // =========================
    filtroTodos.onclick = () => { filtroEstado = "todos"; render(buscador.value); };
    filtroDisponible.onclick = () => { filtroEstado = "disponible"; render(buscador.value); };
    filtroStockBajo.onclick = () => { filtroEstado = "bajo"; render(buscador.value); };
    filtroAgotado.onclick = () => { filtroEstado = "agotado"; render(buscador.value); };

    // =========================
    // FILTROS CATEGORÍA
    // =========================
    filtrosCategoria.forEach(btn => {

        btn.onclick = () => {

            filtrosCategoria.forEach(b => b.classList.remove("filtro_categoria_activo"));
            btn.classList.add("filtro_categoria_activo");

            categoriaActual = btn.textContent.trim();
            render(buscador.value);
        };
    });

    // =========================
    // BUSCADOR
    // =========================
    buscador.oninput = () => render(buscador.value);

    // =========================
    // AGREGAR
    // =========================
    btnAgregar.onclick = () => modal();

    // =========================
    // START
    // =========================
    cargar();
    render();
});