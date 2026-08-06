# Manual de Diseño y Arquitectura Visual — Ligas Deportivas La Salle

Este documento establece las especificaciones de diseño visual, arquitectura por pestañas, temas por deporte, componentes y reglas de reportes para garantizar la coherencia gráfica entre las aplicaciones hermanas de **Preparatoria**, **Secundaria** y **Primaria**.

---

## 1. Identidad Visual y Sistema de Color

### Paleta de Colores Institucional
- **Azul Marino Institucional**: `#101097` (Navbars, botones primarios, encabezados principales).
- **Azul Noche Profundo (Modo Oscuro)**: `#001E61` / `dark:bg-gray-900`.
- **Rojo Carmesí (Peligro/Borrar)**: `#CE0E2D` (Botones de eliminación y partido anulado).
- **Efectos Glassmorphism**:
  - Modo Claro: `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);`
  - Modo Oscuro: `background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(12px);`

### Tipografía
- **Títulos y Encabezados**: Google Font `'Outfit'`, sans-serif (pesos: 700, 800, 900).
- **Cuerpo de Texto y Tablas**: Google Font `'Inter'`, sans-serif (pesos: 400, 500, 600).

### Sistema de Modo Oscuro / Claro
- Se configura en Tailwind mediante la clase `darkMode: 'class'`.
- Alterna la clase `.dark` / `.light` en la etiqueta `<html>`.
- Persistencia automática en `localStorage.setItem('theme', 'dark' | 'light')`.
- Botón conmutador accesible en la barra superior con iconos ☀️ (Sol) y 🌙 (Luna).

---

## 2. Cabecera Institucional (`<nav>`)

- **Estructura Izquierda**:
  - Escudo institucional de La Salle (`https://i.imgur.com/pbiHVPL.png`, 40x40px).
  - Título principal: **Ligas La Salle** (`text-white font-extrabold text-xl`).
  - Distintivo de Sección: **PREPARATORIA** (o **PRIMARIA** / **SECUNDARIA**) en cápsula con borde semi-transparente (`bg-white/20 text-white rounded-full uppercase`).
- **Estructura Derecha**:
  - Botones con píldora redondeada (`.nav-button`) para **Clasificación**, **Admin**, **Cerrar Sesión** y el **Conmutador de Modo Oscuro/Claro**.
  - **Garantía de legibilidad**: Todos los textos e iconos SVG dentro del `<nav>` fuerzan la clase `text-white`.

---

## 3. Vista Pública: Sports Hub Pro (Clasificación y Resultados)

### A. Banner "Hero" Dinámico por Deporte
El encabezado público cambia sus colores y gradientes según la disciplina deportiva del torneo activo:
- ⚽ **Fútbol**: Gradiente Azul Real a Índigo (`from-blue-700 via-indigo-800 to-slate-900`).
- 🏀 **Básquetbol**: Gradiente Naranja Fuego (`from-amber-600 via-orange-700 to-slate-900`).
- 🏈 **Tocho**: Gradiente Verde Esmeralda (`from-emerald-700 via-teal-800 to-slate-900`).
- 🏐 **Voleibol**: Gradiente Violeta Neón (`from-purple-700 via-violet-800 to-slate-900`).

Incluye animaciones CSS en el fondo:
- `.animate-float`: Emoji gigante del deporte con flotación continua.
- `.animate-glow`: Resplandor suave con pulso de luz.

### B. Barra de Estadísticas Rápidas (Quick Stats Counter)
Cuatro mini-tarjetas flotantes tipo Dashboard sobre el Hero:
1. **Líder General / Líder de Liga**: Busca el equipo con más puntos globales entre todas las ligas. Si hay empate, lista los nombres de los equipos empatados.
2. **Líder Anotador / Modalidad**: Busca al jugador con más anotaciones globales en todo el torneo (ej. 👑 Ámbar Valeria con 23 goles).
3. **Partidos Jugados**: Conteo total de encuentros disputados.
4. **Anotaciones Totales**: Suma de puntos/goles anotados.

*Al filtrar por una liga individual, los valores y títulos del banner cambian dinámicamente a "Líder de Liga" y "Goleador de Liga".*

### C. Tabla de Clasificaciones con Podio 3D
- **🥇 1er Lugar (Oro)**: Fila en tono dorado suave (`bg-amber-50/50 border-l-4 border-amber-400`).
- **🥈 2do Lugar (Plata)**: Fila en tono plateado (`bg-slate-50/40 border-l-4 border-slate-300`).
- **🥉 3er Lugar (Bronce)**: Fila en tono cobrizo (`bg-amber-900/5 border-l-4 border-amber-700`).
- **Animación Hover 3D**: `hover:translate-x-1 transition-all duration-200`.

### D. Terminología Adaptativa por Deporte
Un helper centralizado `getSportScoringInfo(sport)` asigna la nomenclatura correcta:
- **Fútbol**: *Goles* / *Goleadores* / *Líder Goleador*.
- **Básquetbol**: *Canastas* / *Anotadores* / *Líder en Canastas*.
- **Tocho**: *Touchdowns (TDs)* / *Anotadores* / *Líder en Touchdowns*.
- **Voleibol**: Desactiva el registro de anotadores individuales y muestra el mensaje: `"🏐 En Voleibol no se lleva registro de anotadores individuales"`.

---

## 4. Panel de Administración por Pestañas (Sub-tabs)

El panel de administración se divide en 4 pestañas superiores para evitar desplazamientos largos:

1. **🏆 Torneos & Backup**:
   - Selector de torneo activo y botón de eliminación.
   - Creación de nuevo torneo con selección de Deporte y Semestre escolar.
   - Exportación e importación de respaldo en JSON.
2. **👥 Plantillas & Equipos**:
   - Desplegable de asignación de días de juego por liga (`matchDay`).
   - Botón **`✏️ Cambiar País`** en cada equipo con modal interactivo para cambiar país y bandera oficial (36 países).
   - Botón **`Añadir Jugadores`** para alta masiva por salto de línea.
3. **⚽ Calendario & Partidos**:
   - Generador y borrador del calendario Round Robin (Ida y Vuelta).
   - Filtros combinados de fecha y liga.
   - Registro de marcadores y anotadores por partido.
   - Botón **`Anular (0-0)`** para partidos suspendidos por clima o festivos.
4. **📄 Reportes & PDFs**:
   - Generación de cédulas oficiales para árbitros con espacio para firmas.
   - Informes en PDF de Próximos Partidos, Clasificación y Plantillas completas de Equipos.

---

## 5. Reglas de Generación de Reportes PDF (jsPDF + autoTable)

1. **Inclusión de Logo Institucional**: Todos los reportes llevan el escudo oficial de La Salle en la esquina superior.
2. **Salto de Página por Liga**: Cada liga debe comenzar en una página nueva (`doc.addPage()`).
3. **Contraste de Texto Estricto**: Todo el texto de las tablas debe usar negro puro (`textColor: [0, 0, 0]`) para facilitar su lectura impresa.
4. **Formato Compacto**: Alto de celda reducido (`cellPadding: 1`, `fontSize: 8`) para lograr incluir 4 equipos completos por hoja.

---

## 6. Lógica de Semestres y Clonación de Plantillas

- **1er Semestre (Sep - Dic)**: Ligas `1ro A, 1ro B, 3ro A, 3ro B, QB, FM, CSH, EA`.
- **2do Semestre (Feb - Jun)**: Ligas `2do A, 2do B, 4to A, 4to B, QB, FM, CSH, EA`.
- **Clonación de Plantillas**:
  - Al crear un segundo torneo dentro del mismo semestre, la app detecta el torneo anterior y ofrece la opción de **copiar automáticamente las 8 ligas, los 32 equipos y todos los alumnos registrados**, eliminando la necesidad de reescribir plantillas.
