# 🚀 Guía de Migración a Vite — Ligas La Salle Primaria

Este documento establece las instrucciones paso a paso para realizar la **migración completa a Vite + React + TailwindCSS v4** de la aplicación hermana **Ligas La Salle Primaria**, tomando como referencia exacta el proceso exitoso implementado en la app de Secundaria.

> [!IMPORTANT]
> **REGLA DE ORO DE MIGRACIÓN:**
> La migración debe ser una **copia fiel e idéntica** de la aplicación original de Primaria.
> - **NO inventar ni agregar funcionalidades nuevas.**
> - **NO alterar la lógica de negocio, reglas de puntos, nombres de colecciones de Firebase ni diseño visual.**
> - Respetar 100% la estructura de datos, modales, alertas de Telegram, generador de PDFs y póster de Facebook existentes.

---

## 📌 1. Requisitos Previos e Instalación

### 1.1 Crear el Subdirectorio `vite-app`
En la raíz del proyecto de Primaria, inicializar un nuevo proyecto con Vite y React:

```bash
npx -y create-vite@latest vite-app --template react
cd vite-app
npm install
```

### 1.2 Instalación de Dependencias Necesarias
Instalar los paquetes exactos requeridos para TailwindCSS v4, Firebase, PDF y capturas:

```bash
npm install firebase jspdf jspdf-autotable html2canvas tailwindcss @tailwindcss/vite
```

---

## ⚙️ 2. Configuración del Proyecto Vite

### 2.1 Archivo `vite-app/vite.config.js`
Reemplazar el contenido de `vite.config.js` con la siguiente configuración compatible con rutas relativas (`base: './'`):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
})
```

### 2.2 Estilos Principales `vite-app/src/index.css`
Configurar TailwindCSS v4, fuentes tipográficas (Outfit e Inter) y la animación continua del ticker marquee:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

@theme {
    --font-outfit: 'Outfit', sans-serif;
    --font-inter: 'Inter', sans-serif;
}

.font-outfit { font-family: 'Outfit', sans-serif; }

/* Animación de Ticker Marquee Infinito */
@keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
}

.animate-marquee {
    display: inline-flex;
    width: max-content;
    animation: marquee 35s linear infinite;
}

.animate-marquee:hover {
    animation-play-state: paused;
}

@layer utilities {
    .nav-button { @apply transition-all duration-300 font-medium; }
    .nav-button.active {
        background-color: #ffffff !important;
        color: #101097 !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        font-weight: 700;
    }
    .btn-primary {
        @apply py-2.5 px-6 bg-gradient-to-r from-[#101097] to-[#2a2ad9] text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101097] transition-all duration-300 cursor-pointer;
    }
    .btn-danger {
        @apply py-2.5 px-6 bg-gradient-to-r from-[#CE0E2D] to-[#ff4d63] text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CE0E2D] transition-all duration-300 cursor-pointer;
    }
    .card {
        @apply bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-700/60 transition-all duration-300;
    }
    .input-modern {
        @apply w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#101097] focus:border-transparent transition-all duration-300;
    }
}

input, select, select option, textarea {
    background-color: #ffffff;
    color: #1e293b;
}

.dark input, .dark select, .dark select option, .dark textarea {
    background-color: #1e293b;
    color: #ffffff;
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }
```

---

## 📁 3. Estructura Modular de Archivos en `src/`

Organizar los componentes y servicios dentro de `vite-app/src/` exactamente en la siguiente jerarquía:

```
vite-app/src/
├── config/
│   ├── firebase.js       # Instancia e inicialización de Firestore y Auth para Primaria
│   └── constants.js      # APP_ID ('lasalle-primaria-deportes'), Telegram, Clubes Champions, SportInfo
├── components/
│   ├── Icons.jsx                # Iconos SVG de la aplicación
│   ├── Modal.jsx                # Modal genérico de mensajes/alertas
│   ├── ClubSelectorModal.jsx    # Modal de selección de escudo UEFA Champions League
│   ├── TeamProfileModal.jsx     # Perfil y plantilla detallada del equipo
│   ├── SportsHeroBanner.jsx     # Hero Banner por deporte con estadísticas rápidas
│   ├── StandingsTable.jsx       # Tabla de posiciones con Podio 3D y scroll táctil móvil
│   ├── ResultsList.jsx          # Lista de marcadores y últimos juegos
│   ├── TopScorersTable.jsx      # Tabla de goleadores / anotadores por deporte
│   ├── InteractiveCalendar.jsx  # Calendario de 7 días con días de juego e inauguración
│   ├── MatchesView.jsx          # Vista de partidos por jornada con escudos y edición
│   ├── Ticker.jsx               # Banner Marquee continuo de próximos partidos
│   └── LeagueCard.jsx           # Tarjeta de gestión de ligas, plantillas y alumnos
├── utils/
│   ├── pdfGenerator.js   # Generación de Cédula de Árbitro, Roster Completo sin cortes y Clasificación
│   └── facebookPoster.js # Generación del Póster Visual y texto formateado para Facebook
├── App.jsx               # Componente principal React
├── App.css
├── index.css
└── main.jsx
```

---

## 🔑 4. Puntos Críticos de Configuración Específicos para Primaria

### 4.1 Archivo `src/config/firebase.js`
Asegurar que el `APP_ID` corresponda a Primaria:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const APP_ID = 'lasalle-primaria-deportes'; // ⚠️ ID Estricto de Primaria

const firebaseConfig = {
    apiKey: "AIzaSyBHX9ezfBiEZhxIDZTr-OTB5hgKV-zt0G4",
    authDomain: "torneos-lasalle-2.firebaseapp.com",
    projectId: "torneos-lasalle-2",
    storageBucket: "torneos-lasalle-2.firebasestorage.app",
    messagingSenderId: "860168864523",
    appId: "1:860168864523:web:1da5a47fa8ccb20def980e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4.2 Archivo `src/config/constants.js`
Verificar el identificador de notificaciones de Telegram para Primaria:

```javascript
export const APP_LEVEL_NAME = '🏫 PRIMARIA'; // ⚠️ Identificador de Telegram para Primaria

export const TELEGRAM_BOT_TOKEN = '8314025136:AAG3P1AoU1rExMIeTEsE_1YDxc-Vj3r9Tac';
export const TELEGRAM_CHAT_ID = '6740086';

export const sendTelegramNotification = async (title, message) => {
    try {
        const fullMessage = `<b>${title}</b>\n\n${message}`;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: fullMessage,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.error("Error al enviar notificación a Telegram:", e);
    }
};
```

---

## 🛠️ 5. Mantenimiento de Lógica de Negocio (Sin Alteraciones)

Al copiar el código a `App.jsx` y las utilidades, mantener intacta la siguiente lógica:

1. **Auto-Detección de Días Festivos SEP (185 Días)**:
   - La función `getNextValidWednesday` debe omitir el 16 de Septiembre, 5 de Mayo, 2 de Noviembre y periodos vacacionales (Diciembre-Enero, Semana Santa y Verano).
2. **Lógica Matemática de Inauguración Deportiva (Sábado)**:
   - Al establecer o cambiar la fecha de inauguración (sábado), los partidos del miércoles previo se trasladan al sábado y son oficiales para la tabla.
   - Al borrar o cambiar la fecha, cualquier partido en sábado se **revierte matemáticamente a su miércoles original** (`Sábado - 3 días`).
3. **Preservación del Campo `originalDate`**:
   - Cada partido en Firestore debe conservar su campo `originalDate` para garantizar que pueda retornar a su miércoles correspondiente en cualquier momento.
4. **Diseño Móvil Responsivo y Adaptativo**:
   - Utilizar las mismas clases responsivas (`sm:`, `md:`, `overflow-x-auto`, `truncate`, etc.) para asegurar que la app se vea perfecta en smartphones.

---

## 📦 6. Compilación y Despliegue en GitHub Pages

Una vez verificada la aplicación en modo desarrollo (`npm run dev`):

1. **Ejecutar el Build de Producción**:
   ```bash
   cd vite-app
   npm run build
   ```

2. **Copiar los Archivos Compilados a la Raíz del Repositorio**:
   Copiar todo el contenido de `vite-app/dist/*` hacia la raíz del repositorio de Primaria.

3. **Verificar Archivos Estáticos**:
   - Confirmar que exista `.nojekyll` en la raíz para evitar que GitHub Pages ignore carpetas que inician con `_`.
   - Confirmar que `index.html` en la raíz apunte a los assets generados en `./assets/`.

4. **Hacer Commit y Push a GitHub**:
   ```bash
   git add .
   git commit -m "feat: migración completa a Vite + React + TailwindCSS v4 (Copia Fiel Primaria)"
   git push origin main
   ```

---

## ✅ Lista de Verificación Final de la Migración

- [ ] ¿El `APP_ID` es `'lasalle-primaria-deportes'`?
- [ ] ¿El identificador de Telegram es `'🏫 PRIMARIA'`?
- [ ] ¿Todos los logos oficiales (La Salle Tuxtla) y escudos de Champions League se cargan correctamente?
- [ ] ¿Se mantienen todas las funciones de edición de marcadores, tablas con Podio 3D, goleadores y reportes en PDF?
- [ ] ¿Se probó la vista en dispositivos móviles (celulares)?
- [ ] ¿El build de producción compiló limpiamente y fue desplegado a GitHub Pages?
