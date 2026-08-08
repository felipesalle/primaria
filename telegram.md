# 📢 Guía de Integración de Notificaciones de Telegram

Este documento proporciona las instrucciones paso a paso y el código listo para integrar el sistema de notificaciones por Telegram en las aplicaciones hermanas del sistema de **Torneos La Salle** (**Primaria**, **Secundaria** y **Preparatoria**).

---

## 🔑 Credenciales del Bot de Telegram

Todas las aplicaciones comparten el mismo Bot y Chat ID para centralizar la recepción de alertas en Telegram:

- **Bot Token:** `8314025136:AAG3P1AoU1rExMIeTEsE_1YDxc-Vj3r9Tac`
- **Chat ID:** `6740086`

---

## 🏷️ Identificación por Nivel Educativo

Para diferenciar instantáneamente desde qué aplicación proviene cada mensaje en Telegram, cada app define la constante `APP_LEVEL_NAME`:

- **Primaria:** `const APP_LEVEL_NAME = '🏫 PRIMARIA';`
- **Secundaria:** `const APP_LEVEL_NAME = '🏫 SECUNDARIA';`
- **Preparatoria:** `const APP_LEVEL_NAME = '🎓 PREPARATORIA';`

---

## 💻 Código JavaScript de la Función (`sendTelegramNotification`)

Copia y pega la siguiente función en el archivo principal (ej. `index.html` o script JS principal) de las aplicaciones de **Secundaria** o **Preparatoria**:

```javascript
// --- Telegram Notification Function ---
const TELEGRAM_BOT_TOKEN = '8314025136:AAG3P1AoU1rExMIeTEsE_1YDxc-Vj3r9Tac';
const TELEGRAM_CHAT_ID = '6740086';
// ⚠️ Cambiar según la app objetivo: '🏫 SECUNDARIA' o '🎓 PREPARATORIA'
const APP_LEVEL_NAME = '🏫 SECUNDARIA'; 

const sendTelegramNotification = async (message, userEmail) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("Telegram bot token or chat ID not configured.");
        return;
    }
    try {
        const cleanEmail = userEmail || 'Usuario Administrador';
        const cleanMsg = typeof message === 'string' ? message.replace(/\*/g, '') : message;
        const fullMessage = `📌 [TORNEOS ${APP_LEVEL_NAME}]\n🔔 ACCIÓN EN LA APP:\n${cleanMsg}\n\n👤 Realizada por: ${cleanEmail}`;
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: fullMessage,
            }),
        });

        const data = await response.json();
        if (data.ok) {
            console.log("Notificación de Telegram enviada con éxito.");
        } else {
            console.error("Telegram API error:", data.description);
        }
    } catch (error) {
        console.error("Error de red enviando notificación a Telegram:", error);
    }
};
```

---

## 📍 Puntos de Invocación en la Aplicación

Asegúrate de llamar a `sendTelegramNotification(mensaje, user.email)` en los siguientes 7 eventos clave del panel de administración:

1. **Inicio de Sesión Admin (`handleLogin`):**
   ```javascript
   sendTelegramNotification("Ha iniciado sesión en el modo administrador.", email);
   ```

2. **Guardar Marcador de Partido (`handleSaveMatchScore`):**
   ```javascript
   const notificationMessage = `Resultado de Partido Registrado\n\n` +
       `Liga: ${getLeagueName(selectedMatch.leagueId)}\n` + 
       `Fecha: ${selectedMatch.date}\n\n` + 
       `Resultado Final:\n` + 
       `${homeTeamName} ${scoreHome} - ${scoreAway} ${awayTeamName}\n` + 
       `${scorersMessage}`;
   sendTelegramNotification(notificationMessage, user.email);
   ```

3. **Anular Partido (`handleNullifyMatch`):**
   ```javascript
   const notificationMessage = `Partido Anulado\n\n` +
       `Liga: ${getLeagueName(selectedMatch.leagueId)}\n` +
       `Fecha: ${selectedMatch.date}\n\n` +
       `Partido:\n` +
       `${getTeamName(selectedMatch.homeTeamId)} vs ${getTeamName(selectedMatch.awayTeamId)}\n\n` +
       `El partido ha sido anulado y registrado como un empate 0-0.`;
   sendTelegramNotification(notificationMessage, user.email);
   ```

4. **Añadir Equipo a Liga (`handleAddTeam`):**
   ```javascript
   sendTelegramNotification(`Equipo añadido a liga ${getLeagueName(leagueId)}: ${newTeam.name}`, user.email);
   ```

5. **Editar Equipo (`handleUpdateTeam`):**
   ```javascript
   sendTelegramNotification(`Equipo actualizado: ${name} (ID: ${teamId})`, user.email);
   ```

6. **Añadir Jugadores (`handleAddMultiplePlayers`):**
   ```javascript
   sendTelegramNotification(`Jugadores añadidos al equipo ${getTeamName(teamId)}: ${players.map(p => p.name).join(', ')}`, user.email);
   ```

7. **Cambiar Día de Partido (`handleMatchDayChange`):**
   ```javascript
   sendTelegramNotification(`Día de partido actualizado para liga ${getLeagueName(leagueId)} a ${dayLabel}`, user.email);
   ```

---

## 🚀 Pasos para Integrar en los Proyectos Secu y Prepa

Cuando abras la carpeta del proyecto de **Secundaria** o **Preparatoria** en el asistente:

1. Menciónale o muestra este archivo [`telegram.md`](file:///c:/Users/Felipe/Documents/PROYECTOS/primaria/telegram.md).
2. Pídele al asistente:
   > *"Por favor integra el sistema de notificaciones de Telegram siguiendo el archivo `telegram.md`, configurando la constante `APP_LEVEL_NAME` a `🏫 SECUNDARIA` (o `🎓 PREPARATORIA`)."*
3. Realiza la prueba cerrando e iniciando sesión en esa app.
