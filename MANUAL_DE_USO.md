# 🏆 Manual de Uso - Torneos Primaria La Salle (Sports Hub Pro)

Este manual está diseñado para el equipo de la **Coordinación de Deportes**. Guía paso a paso la administración del sistema, el registro de partidos y las medidas de seguridad para equipos compartidos.

---

## 📌 1. Acceso a la Aplicación y Seguridad de Sesión

### 🌐 Dirección Web
La aplicación es accesible desde cualquier navegador web moderno:
👉 **URL:** [https://felipesalle.github.io/primaria/](https://felipesalle.github.io/primaria/) (o localmente en `http://localhost:3000`)

---

### 🔑 Iniciar Sesión (Acceso Administrador)

1. Haz clic en el botón **`Iniciar Sesión`** (o dirígete a la pestaña **Modo Administrador**).
2. Ingresa tu correo personal asignado *(ej. `deportes_profesor1@lasalle.edu.mx`)* y tu contraseña.
3. Al ingresar con éxito:
   - Se activarán todas las opciones de edición.
   - Se enviará una notificación instantánea al grupo de Telegram avisando quien inició sesión.

---

### 🛡️ Medidas de Seguridad en Computadoras Compartidas

> ⚠️ **IMPORTANTE:** Cuando varios profesores utilizan la misma computadora en la oficina de deportes, es fundamental garantizar la trazabilidad de los cambios.

1. **Sesión Temporal Automática (`SESSION Persistence`):**
   - La aplicación está configurada para **cerrar sesión automáticamente al cerrar la pestaña o el navegador**.
   - No se guardan credenciales permanentes en el equipo.
2. **Auto-completado Desactivado:**
   - Al escribir tu correo o contraseña, el navegador no guardará tu clave para que el siguiente usuario no pueda ingresar con tu cuenta accidentalmente.
3. **Cerrar Sesión Manualmente:**
   - Al finalizar de registrar tus partidos, haz clic en el botón rojo **`Cerrar Sesión`** en la barra superior.

---

## 📊 2. Vistas Principales

### 🟢 Vista Pública (Público, Padres y Alumnos)
- **Banners Informativos Lado a Lado:** Muestran líderes y anotadores destacados de Fútbol y Básquetbol.
- **Tabla de Posiciones:** Muestra Partidos Jugados (JJ), Ganados (JG), Empatados (JE), Perdidos (JP), Goles/Puntos a Favor (GF/PF), En Contra (GC/PC), Diferencia (DIF) y Puntos Totales (PTS).
- **Ficha de Equipo:** Al hacer clic en cualquier equipo de la tabla, se abre un modal flotante con su plantilla de jugadores y su calendario de partidos individuales.

---

## 🛠️ 3. Panel de Administrador

### Tab 1: 🏆 Gestión de Torneos y Ligas
- Permite crear nuevos torneos o ligas (Fútbol Femenil/Varonil, Básquetbol Femenil/Varonil) por categorías.

---

### Tab 2: 👥 Plantillas & Equipos (Con Candado de Seguridad)

- **⚡ Cargar Equipos de la Temática:**
  Asigna instantáneamente nombres y escudos oficiales de catálogos predefinidos (Liga MX, Premier League, LaLiga, NBA, etc.).
- **🔒 Candado de Seguridad de Equipos:**
  - Una vez generado el calendario de partidos de la liga, la edición de nombres de equipos **se bloquea automáticamente** para proteger la integridad de las estadísticas y el historial.
  - Si necesitas corregir la errata en un nombre o modificar un escudo, haz clic en el botón **`Desbloquear 🔓`**, confirma la advertencia y realiza la corrección.

---

### Tab 3: 📅 Calendario Escolar & Registro de Partidos

#### 1. Generador Automático de Calendario
- Selecciona la **Fecha de Inicio del Torneo** (Viernes) y la **Inauguración Deportiva** (Sábado opcional).
- Haz clic en **`⚡ Generar Calendario Escolar`**. La app calculará automáticamente las jornadas omitiendo vacaciones escolares, CTE y festivos.

#### 2. ⚽ Registro de Marcadores y Anotadores
1. Selecciona la liga y haz clic en el partido deseado en la lista o en el **Calendario Interactivo**.
2. Ingresa el marcador final (ej. `3 - 1`).
3. Agrega los anotadores individuales haciendo clic en **`+ Añadir Anotador`** y seleccionando el jugador correspondiente.
4. Haz clic en **`Guardar Resultado`**.

#### 3. 🚫 Anular Partido
Si un partido no se jugó o se suspende definitivamente:
1. Abre el partido y presiona **`Anular Partido`**.
2. Se registrará automáticamente como un empate `0-0` (1 punto para cada equipo) sin alterar las estadísticas de goleadores.

---

## 📢 4. Notificaciones Automáticas en Telegram

Cada vez que realices una de las siguientes acciones, se enviará un mensaje automático a Telegram identificando la app (`📌 [TORNEOS 🏫 PRIMARIA]`) y el usuario responsable:

- 🔑 Inicio de Sesión.
- ⚽ Registro o actualización de marcador de partido.
- 🚫 Anulación de partido.
- 👥 Creación, edición o eliminación de equipos.
- 📝 Adición de jugadores a un equipo.
- 📅 Modificación de días de jornada.

---

## 💡 Resumen de Buenas Prácticas para Profesores

1. **No compartir contraseñas:** Cada profesor debe ingresar con su propio correo.
2. **Cerrar sesión al terminar:** Pulsar `Cerrar Sesión` antes de levantarse del equipo.
3. **No forzar desbloqueos innecesarios:** Usar la función `Desbloquear 🔓` únicamente si hay errores ortográficos en el nombre de un equipo.
