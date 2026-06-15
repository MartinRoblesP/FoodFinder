document.addEventListener("DOMContentLoaded", function () {
    const platos = JSON.parse(localStorage.getItem("platos")) || [];

    const valorVentasHoy = document.getElementById("valorVentasHoy");
    const valorPedidosHoy = document.getElementById("valorPedidosHoy");
    const valorTicketPromedio = document.getElementById("valorTicketPromedio");

    const graficoVentasDia = document.querySelector(".card_ventasDiarias #card1");
    const platosMasVendidosDia = document.querySelector(".card_ventasDiarias #card2");

    const graficoVentasMes = document.querySelector(".card_ventasMensuales #card1");
    const platosMasVendidosMes = document.querySelector(".card_ventasMensuales #card2");
    
    function convertirNumero(valor) {
        return parseFloat(String(valor).replace("S/", "").trim()) || 0;
    }

    function calcularVentasTotales() {
        let total = 0;

        platos.forEach(function (plato) {
            const precio = convertirNumero(plato.precio);
            const pedidos = parseInt(plato.pedidos) || 0;

            total += precio * pedidos;
        });

        return total;
    }

    function calcularPedidosTotales() {
        let total = 0;

        platos.forEach(function (plato) {
            total += parseInt(plato.pedidos) || 0;
        });

        return total;
    }

    function pintarCards() {
        const ventas = calcularVentasTotales();
        const pedidos = calcularPedidosTotales();
        const ticketPromedio = pedidos > 0 ? ventas / pedidos : 0;

        valorVentasHoy.textContent = "S/ " + ventas.toFixed(2);
        valorPedidosHoy.textContent = pedidos;
        valorTicketPromedio.textContent = "S/ " + ticketPromedio.toFixed(2);
    }

    function crearGraficoBarras(contenedor, datos, labels) {
    const titulo = contenedor.querySelector("h6").outerHTML;
    contenedor.innerHTML = titulo;

    const cajaGrafico = document.createElement("div");
    cajaGrafico.classList.add("grafico-barras");

    const maximo = Math.max(...datos, 1);

    datos.forEach(function (valor, index) {
        const altura = valor > 0 ? (valor / maximo) * 90 : 5;

        const barraContenedor = document.createElement("div");
        barraContenedor.classList.add("barra-contenedor");

        barraContenedor.innerHTML = `
            <div class="barra" title="S/ ${valor.toFixed(2)}" style="height: ${altura}px;"></div>
            <span class="label-barra">${labels[index]}</span>
        `;

        cajaGrafico.appendChild(barraContenedor);
    });

    contenedor.appendChild(cajaGrafico);
    }

    function pintarVentasPorDia() {
        const ventasTotales = calcularVentasTotales();

        const ventasDias = [
            ventasTotales * 0.45,
            ventasTotales * 0.70,
            ventasTotales * 0.40,
            ventasTotales * 0.85,
            ventasTotales * 0.60,
            ventasTotales,
            ventasTotales * 0.75,
            ventasTotales * 0.55,
            ventasTotales * 0.90,
            ventasTotales * 0.65,
            ventasTotales * 0.98,
            ventasTotales * 0.98
        ];

        const labels = ["L", "M", "MI", "J", "V", "S", "D", "L", "M", "MI", "J", "V"];

        crearGraficoBarras(graficoVentasDia, ventasDias, labels);
    }

    function pintarVentasPorMes() {
        const ventasTotales = calcularVentasTotales();

        const ventasMeses = [
            ventasTotales * 0.45,
            ventasTotales * 0.70,
            ventasTotales * 0.42,
            ventasTotales * 0.85,
            ventasTotales * 0.60,
            ventasTotales,
            ventasTotales * 0.75,
            ventasTotales * 0.55,
            ventasTotales * 0.88,
            ventasTotales * 0.65,
            ventasTotales,
            ventasTotales
        ];

        const labels = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

        crearGraficoBarras(graficoVentasMes, ventasMeses, labels);
    }

    function pintarPlatosMasVendidos(contenedor) {
        const titulo = contenedor.querySelector("h6").outerHTML;
        contenedor.innerHTML = titulo;

        const platosOrdenados = [...platos].sort(function (a, b) {
            return (parseInt(b.pedidos) || 0) - (parseInt(a.pedidos) || 0);
        });

        const totalPedidos = calcularPedidosTotales();

        if (platosOrdenados.length === 0 || totalPedidos === 0) {
            contenedor.innerHTML = titulo + "<p>No hay ventas registradas todavía.</p>";
            return;
            }

        platosOrdenados.slice(0, 4).forEach(function (plato) {
            const pedidos = parseInt(plato.pedidos) || 0;
            const porcentaje = totalPedidos > 0 ? (pedidos / totalPedidos) * 100 : 0;

            const item = document.createElement("div");
            item.classList.add("item-plato");

            item.innerHTML = `
                <div class="info-plato">
                    <span>${plato.nombre}</span>
                    <strong>${porcentaje.toFixed(0)}%</strong>
                </div>
                <div class="linea-fondo">
                    <div class="linea-verde" style="width: ${porcentaje}%;"></div>
                </div>
            `;

            contenedor.appendChild(item);
        });
    }

    pintarCards();
    pintarVentasPorDia();
    pintarVentasPorMes();
    pintarPlatosMasVendidos(platosMasVendidosDia);
    pintarPlatosMasVendidos(platosMasVendidosMes);
});