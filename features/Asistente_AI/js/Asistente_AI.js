// ==========================================
// CONFIGURACIÓN DE SUPABASE 
// ==========================================
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46"; 

let supabaseClient = null;

// Validamos si la librería de Supabase cargó correctamente
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Librería de Supabase no detectada. Las consultas a Supabase serán omitidas.");
}

// ==========================================
// VARIABLES GLOBALES
// ==========================================

let apiKeyInput, chatInput, chatResponseArea;

// ==========================================
// CARGA Y CONFIGURACIÓN DE EVENTOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    apiKeyInput = document.getElementById('openai-key');
    chatInput = document.getElementById('chat-message');
    chatResponseArea = document.getElementById('chat-responses');
    
    const btnGenerarImagen = document.getElementById('btn-generar-imagen');
    const btnEnviar = document.querySelector('button[onclick="enviarConsultaIA()"]');

    if (apiKeyInput) {
        const savedKey = localStorage.getItem('user_openai_key');
        if (savedKey) apiKeyInput.value = savedKey;

        apiKeyInput.addEventListener('input', guardarApiKey);
    }

    if (btnEnviar) {
        btnEnviar.removeAttribute('onclick');
        btnEnviar.addEventListener('click', enviarConsultaIA);
    }

    if (btnGenerarImagen) {
        btnGenerarImagen.addEventListener('click', generarImagenIA);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarConsultaIA();
            }
        });
    }
});

// ==========================================
// FUNCIONES DE LÓGICA
// ==========================================

function guardarApiKey() {
    const key = apiKeyInput.value.trim();

    if (key.startsWith('sk-')) {
        localStorage.setItem('user_openai_key', key);
        console.log('API Key guardada localmente.');
    } else if (key === '') {
        localStorage.removeItem('user_openai_key');
    }
}

// ==========================================
// FUNCIÓN PARA OBTENER DATOS DE SUPABASE
// ==========================================

async function obtenerContextoBD() {
    if (!supabaseClient) {
        return {
            usuarios: [],
            platos: [],
            pedidos: [],
            inventario: []
        };
    }

    const contexto = {
        usuarios: [],
        platos: [],
        pedidos: [],
        inventario: []
    };

    try {
        const { data: usuarios, error: errorUsuarios } = await supabaseClient
            .from("usuarios")
            .select("id, nombre, correo, telefono, rol, direccion_negocio, fecha_registro");

        if (!errorUsuarios && usuarios) {
            contexto.usuarios = usuarios;
        } else {
            console.warn("No se pudieron obtener usuarios:", errorUsuarios);
        }

        // Cuando crees estas tablas en Supabase, puedes descomentar estas consultas.

        /*
        const { data: platos, error: errorPlatos } = await supabaseClient
            .from("platos")
            .select("*");

        if (!errorPlatos && platos) {
            contexto.platos = platos;
        } else {
            console.warn("No se pudieron obtener platos:", errorPlatos);
        }

        const { data: pedidos, error: errorPedidos } = await supabaseClient
            .from("pedidos")
            .select("*");

        if (!errorPedidos && pedidos) {
            contexto.pedidos = pedidos;
        } else {
            console.warn("No se pudieron obtener pedidos:", errorPedidos);
        }

        const { data: inventario, error: errorInventario } = await supabaseClient
            .from("inventario")
            .select("*");

        if (!errorInventario && inventario) {
            contexto.inventario = inventario;
        } else {
            console.warn("No se pudo obtener inventario:", errorInventario);
        }
        */

    } catch (error) {
        console.error("Error consultando Supabase:", error);
    }

    return contexto;
}

// ==========================================
// FUNCIÓN PARA ENVIAR CONSULTA A GPT
// ==========================================

async function enviarConsultaIA(event) {
    if (event) event.preventDefault();

    const mensajeUsuario = chatInput.value.trim();
    const apiKey = localStorage.getItem('user_openai_key');

    if (!apiKey) {
        alert('Por favor, ingresa tu API Key de OpenAI en la sección de configuración primero.');
        return;
    }

    if (!mensajeUsuario) return;

    try {
        if (chatResponseArea.innerHTML.includes("Configura tu API Key en el cuadro superior")) {
            chatResponseArea.innerHTML = "";
        }

        chatResponseArea.innerHTML += `<p><b>Tú:</b> ${mensajeUsuario}</p>`;
        chatResponseArea.innerHTML += `<p id="loading"><i>Pensando...</i></p>`;
        chatInput.value = '';
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

        const contexto = await obtenerContextoBD();

        const promptConContexto = `
Eres el asistente de FoodFinder, una plataforma web relacionada con gastronomía, usuarios, pedidos e inventario.

Actualmente la base de datos puede contener esta información:

Usuarios registrados:
${JSON.stringify(contexto.usuarios)}

Platos:
${JSON.stringify(contexto.platos)}

Pedidos:
${JSON.stringify(contexto.pedidos)}

Inventario:
${JSON.stringify(contexto.inventario)}

Importante:
- Si una sección está vacía [], significa que todavía no hay datos registrados o que esa tabla aún no ha sido creada.
- No inventes datos que no estén en la base de datos.
- Responde de forma clara, amable y útil.

Consulta del usuario:
${mensajeUsuario}
`;

        const respuesta = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente experto en gastronomía, usuarios, pedidos e inventarios.'
                    },
                    {
                        role: 'user',
                        content: promptConContexto
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await respuesta.json();

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        if (respuesta.ok) {
            const mensajeIA = data.choices[0].message.content;

            chatResponseArea.innerHTML += `
                <p><b>Asistente IA:</b> ${mensajeIA}</p>
                <hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">
            `;
        } else {
            chatResponseArea.innerHTML += `
                <p style="color: red;"><b>Error:</b> ${data.error.message}</p>
            `;
        }

        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error('Error:', error);

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        alert('Hubo un problema de conexión. Verifica tu internet o tu API Key.');
    }
}

// ==========================================
// FUNCIÓN PARA GENERAR IMÁGENES
// ==========================================

async function generarImagenIA(event) {
    if (event) event.preventDefault();

    const promptUsuario = chatInput.value.trim();
    const apiKey = localStorage.getItem('user_openai_key');

    if (!apiKey) {
        alert('Por favor, ingresa tu API Key de OpenAI en la sección de configuración primero.');
        return;
    }

    if (!promptUsuario) return;

    try {
        if (chatResponseArea.innerHTML.includes("Configura tu API Key en el cuadro superior")) {
            chatResponseArea.innerHTML = "";
        }

        chatResponseArea.innerHTML += `<p><b>Tú (Solicitud de imagen):</b> ${promptUsuario}</p>`;
        chatResponseArea.innerHTML += `<p id="loading"><i>Generando imagen... (Esto puede tomar unos segundos)</i></p>`;
        chatInput.value = '';
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

        const respuesta = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: promptUsuario,
                n: 1,
                size: "1024x1024"
            })
        });

        const data = await respuesta.json();

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        if (respuesta.ok) {
            const urlImagen = data.data[0].url;

            chatResponseArea.innerHTML += `
                <p><b>Asistente IA:</b> Aquí tienes la imagen generada:</p>
                <div class="imagen_ia_contenedor">
                    <img src="${urlImagen}" class="imagen_ia_preview" alt="Imagen generada por IA"/>
                </div>
                <hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">
            `;
        } else {
            chatResponseArea.innerHTML += `
                <p style="color: red;"><b>Error:</b> ${data.error.message}</p>
            `;
        }

        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error('Error:', error);

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        alert('Hubo un problema al generar la imagen. Revisa la consola para más detalles.');
    }
}