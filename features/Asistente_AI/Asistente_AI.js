// ==========================================
// CONFIGURACIÓN DE SUPABASE 
// ==========================================
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO
const SUPABASE_URL = "https://tu-proyecto.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; 

let supabaseClient = null;

// Validamos si la librería de Supabase cargó correctamente 
// (Asegúrate de tener el script CDN de Supabase en tu HTML si vas a usarlo)
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Librería de Supabase no detectada. Las consultas al inventario serán omitidas.");
}

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let apiKeyInput, chatInput, chatResponseArea;

// ==========================================
// CARGA Y CONFIGURACIÓN DE EVENTOS (DOM Ready)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar los elementos basándonos en tu HTML exacto
    apiKeyInput = document.getElementById('openai-key');
    chatInput = document.getElementById('chat-message');
    chatResponseArea = document.getElementById('chat-responses');
    
    const btnGenerarImagen = document.getElementById('btn-generar-imagen');
    // Buscamos el botón de enviar por su atributo onclick, ya que no tiene ID
    const btnEnviar = document.querySelector('button[onclick="enviarConsultaIA()"]');

    // 2. Cargar clave guardada previamente en el LocalStorage
    if (apiKeyInput) {
        const savedKey = localStorage.getItem('user_openai_key');
        if (savedKey) apiKeyInput.value = savedKey;
        
        // Escuchar cambios en el input para guardar la key automáticamente
        apiKeyInput.addEventListener('input', guardarApiKey);
    }

    // 3. Remover el atributo 'onclick' del HTML y manejar el evento desde JS 
    // Esto previene errores de "función no definida" si el JS carga con 'defer'
    if (btnEnviar) {
        btnEnviar.removeAttribute('onclick');
        btnEnviar.addEventListener('click', enviarConsultaIA);
    }

    // 4. Asignar evento al botón de generar imagen
    if (btnGenerarImagen) {
        btnGenerarImagen.addEventListener('click', generarImagenIA);
    }

    // Opcional: Permitir enviar con la tecla "Enter"
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

// Guardar en LocalStorage
function guardarApiKey() {
    const key = apiKeyInput.value.trim();
    if (key.startsWith('sk-')) {
        localStorage.setItem('user_openai_key', key);
        console.log('API Key guardada localmente.');
    } else if (key === '') {
        localStorage.removeItem('user_openai_key');
    }
}

// Función para enviar consulta a GPT (Texto)
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
        // Mostrar mensaje del usuario
        if (chatResponseArea.innerHTML.includes("Configura tu API Key en el cuadro superior")) {
            chatResponseArea.innerHTML = ""; // Limpiar mensaje inicial
        }
        chatResponseArea.innerHTML += `<p><b>Tú:</b> ${mensajeUsuario}</p>`;
        chatResponseArea.innerHTML += `<p id="loading"><i>Pensando...</i></p>`;
        chatInput.value = ''; 
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

        // Intentar consultar inventario en Supabase (Opcional)
        let inventario = null;
        if (supabaseClient) {
            const { data, error: supabaseError } = await supabaseClient
                .from('Inventario')
                .select('ingrediente, cantidad');
            
            if (!supabaseError) inventario = data;
        }

        // Construir el prompt
        const promptConContexto = `
            Eres el asistente de cocina de la plataforma web FoodFinder, enfocada en sostenibilidad y comida orgánica para clase media/baja.
            Inventario disponible: ${inventario ? JSON.stringify(inventario) : "No verificado"}.
            Responde de manera amable y útil a esta consulta: "${mensajeUsuario}"
        `;

        // Petición a OpenAI
        const respuesta = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Eres un asistente experto en gastronomía, nutrición e inventarios.' },
                    { role: 'user', content: promptConContexto }
                ],
                temperature: 0.7
            })
        });

        const data = await respuesta.json();
        
        // Quitar indicador de "Pensando..."
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        // Mostrar respuesta o error
        if (respuesta.ok) {
            const mensajeIA = data.choices[0].message.content;
            chatResponseArea.innerHTML += `<p><b>Asistente IA:</b> ${mensajeIA}</p><hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">`;
        } else {
            chatResponseArea.innerHTML += `<p style="color: red;"><b>Error:</b> ${data.error.message}</p>`;
        }
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error('Error:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();
        alert('Hubo un problema de conexión. Verifica tu internet o tu API Key.');
    }
}

// Función para generar imágenes (DALL-E)
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
                model: 'dall-e-3', // Puedes cambiarlo a dall-e-2 si necesitas que sea más barato/rápido
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
                <hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">`;
        } else {
            chatResponseArea.innerHTML += `<p style="color: red;"><b>Error:</b> ${data.error.message}</p>`;
        }
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error('Error:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();
        alert('Hubo un problema al generar la imagen. Revisa la consola para más detalles.');
    }
}