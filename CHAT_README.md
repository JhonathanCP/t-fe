# Configuración de Chat FinSight

## Cómo configurar Hugging Face

1. **Obtener API Key:**
   - Ve a https://huggingface.co/
   - Crea una cuenta gratuita o inicia sesión
   - Ve a Settings > Access Tokens
   - Crea un nuevo token con permisos de lectura

2. **Configurar en la aplicación:**
   - Abre el archivo `src/environments/environment.ts`
   - Reemplaza `'your-huggingface-api-key-here'` con tu API key real

3. **Modelos recomendados gratuitos:**
   - `microsoft/DialoGPT-medium` (conversacional, actual)
   - `microsoft/DialoGPT-small` (más rápido)
   - `facebook/blenderbot-400M-distill` (alternativa)

## Funcionalidades del Chat

- **Conversaciones múltiples:** Crea y gestiona varias conversaciones
- **Historial persistente:** Las conversaciones se guardan en localStorage
- **Interfaz responsive:** Funciona en móviles y escritorio
- **Indicador de escritura:** Muestra cuando la IA está respondiendo
- **Eliminación de sesiones:** Borra conversaciones individuales

## Uso sin API Key

Si no configuras una API key válida, el chat mostrará un mensaje informativo y no realizará llamadas a la API externa.

## Personalización

Puedes cambiar el modelo editando la variable `MODEL_NAME` en el archivo `chat.service.ts`.
