# Guía de Implementación: Asignación de Colores de Playera Gildan para la App de Secundaria (Champions League)

Esta guía contiene las instrucciones precisas paso a paso para replicar y clonar exactamente la funcionalidad de **Colores de Playera Gildan** en el proyecto hermano de **Secundaria** (con temática de UEFA Champions League).

---

## 🎯 Objetivo de la Funcionalidad
1. Asignar un **color representativo oficial del Catálogo Gildan** (`FORPRINT_CATALOGO_GILDAN.pdf`, excluyendo blanco) a cada equipo de Secundaria / Champions League.
2. Mostrar la insignia con la playerita 👕, la muestra circular de color y el **nombre visible del color en texto** (ej. `👕 Azul Claro`, `👕 Royal`, `👕 Rojo`, `👕 Amarillo Brillante`) en la pantalla de administración de `Plantillas & Equipos`.
3. Permitir al administrador cambiar o personalizar el color de la playera de cualquier equipo desde la ventana de edición `EditTeamModal`.
4. Incluir el color de playera en las exportaciones en PDF (ej. "Listas de Equipos por Deporte" y "Lista por Grado y Grupo").

---

## 🛠️ Paso 1: Configuración de la Paleta y Ayudantes (`src/config/constants.js`)

### 1.1. Añadir la Paleta Oficial Gildan (`GILDAN_COLOR_PALETTE`)
En `src/config/constants.js`, definir el arreglo con los 41 colores del catálogo Gildan (sin el color Blanco):

```javascript
export const GILDAN_COLOR_PALETTE = [
    { name: "Amarillo Brillante", hex: "#FFD700", border: "#E6C200", isLight: true },
    { name: "Oro", hex: "#FFA500", border: "#E69500", isLight: true },
    { name: "Naranja", hex: "#FF6600", border: "#E65C00", isLight: false },
    { name: "Naranja S.", hex: "#FF4500", border: "#E63E00", isLight: false },
    { name: "Naranja Jaspe", hex: "#FF7F50", border: "#E67248", isLight: false },
    { name: "Coral", hex: "#FF6F61", border: "#E66458", isLight: false },
    { name: "Azalea", hex: "#E42575", border: "#CD2169", isLight: false },
    { name: "Palo de Rosa", hex: "#E8ADAA", border: "#D19C99", isLight: true },
    { name: "Rosa Seguridad", hex: "#FF69B4", border: "#E65F02", isLight: true },
    { name: "Rosa Tropical", hex: "#E6399B", border: "#CF338C", isLight: false },
    { name: "Rojo", hex: "#D32F2F", border: "#B71C1C", isLight: false },
    { name: "Rojo Cereza", hex: "#990000", border: "#800000", isLight: false },
    { name: "Marrón", hex: "#6D4C41", border: "#5D4037", isLight: false },
    { name: "Chocolate", hex: "#3E2723", border: "#2C1B18", isLight: false },
    { name: "Púrpura", hex: "#4A148C", border: "#3B1070", isLight: false },
    { name: "Púrpura Jaspe", hex: "#7B1FA2", border: "#6A1B8E", isLight: false },
    { name: "Azul Claro", hex: "#81D4FA", border: "#4FC3F7", isLight: true },
    { name: "Azul Celeste", hex: "#29B6F6", border: "#0288D1", isLight: true },
    { name: "Royal Jaspe", hex: "#2979FF", border: "#1765E6", isLight: false },
    { name: "Royal", hex: "#1565C0", border: "#0D47A1", isLight: false },
    { name: "Azul Marino", hex: "#001E61", border: "#0A1442", isLight: false },
    { name: "Azul Marino Jaspe", hex: "#1A237E", border: "#121858", isLight: false },
    { name: "Turquesa", hex: "#00ACC1", border: "#00838F", isLight: false },
    { name: "Turquesa Antiguo", hex: "#00838F", border: "#006064", isLight: false },
    { name: "Jade", hex: "#00897B", border: "#00695C", isLight: false },
    { name: "Verde Pasto", hex: "#2E7D32", border: "#1B5E20", isLight: false },
    { name: "Verde Césped", hex: "#4CAF50", border: "#388E3C", isLight: false },
    { name: "Verde Irlandés", hex: "#00E676", border: "#00C853", isLight: true },
    { name: "Verde Neón", hex: "#76FF03", border: "#64DD17", isLight: true },
    { name: "Verde Seguridad", hex: "#CCFF00", border: "#B2E600", isLight: true },
    { name: "Limón", hex: "#CDDC39", border: "#AFB42B", isLight: true },
    { name: "Verde Militar", hex: "#4B5320", border: "#393F18", isLight: false },
    { name: "Bosque", hex: "#1B5E20", border: "#144718", isLight: false },
    { name: "Índigo", hex: "#3F51B5", border: "#303F9F", isLight: false },
    { name: "Arena", hex: "#E3DAC9", border: "#C7BCAB", isLight: true },
    { name: "Gris Jaspe", hex: "#BDBDBD", border: "#9E9E9E", isLight: true },
    { name: "Gris Jaspe RS", hex: "#9E9E9E", border: "#757575", isLight: false },
    { name: "Grafito Jaspe", hex: "#616161", border: "#424242", isLight: false },
    { name: "Jaspe Oscuro", hex: "#37474F", border: "#263238", isLight: false },
    { name: "Carbón", hex: "#212121", border: "#000000", isLight: false },
    { name: "Negro", hex: "#000000", border: "#000000", isLight: false }
];
```

### 1.2. Asignar Colores Representativos a los Presets de Champions League
Actualizar los arreglos de temáticas en `PRESET_THEMES` para los equipos de la Champions League:

```javascript
// Ejemplo para la temática "Champions League":
{ name: "Real Madrid", logoUrl: "...", shirtColorName: "Azul Claro", shirtColorHex: "#81D4FA" },
{ name: "FC Barcelona", logoUrl: "...", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
{ name: "Bayern München", logoUrl: "...", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
{ name: "Paris Saint-Germain", logoUrl: "...", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
{ name: "Manchester City", logoUrl: "...", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
{ name: "Inter de Milán", logoUrl: "...", shirtColorName: "Royal Jaspe", shirtColorHex: "#2979FF" },
{ name: "AC Milan", logoUrl: "...", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
{ name: "Borussia Dortmund", logoUrl: "...", shirtColorName: "Amarillo Brillante", shirtColorHex: "#FFD700" },
{ name: "Arsenal FC", logoUrl: "...", shirtColorName: "Coral", shirtColorHex: "#FF6F61" },
{ name: "Atlético de Madrid", logoUrl: "...", shirtColorName: "Naranja S.", shirtColorHex: "#FF4500" },
{ name: "Juventus", logoUrl: "...", shirtColorName: "Negro", shirtColorHex: "#000000" },
{ name: "Benfica", logoUrl: "...", shirtColorName: "Azalea", shirtColorHex: "#E42575" },
```

### 1.3. Funciones Ayudantes (`getShirtColorObj` y `getTeamShirtColor`)

```javascript
export const getShirtColorObj = (colorNameOrObj) => {
    if (!colorNameOrObj) return GILDAN_COLOR_PALETTE[0];
    if (typeof colorNameOrObj === 'object' && colorNameOrObj.hex) return colorNameOrObj;
    const found = GILDAN_COLOR_PALETTE.find(c => c.name.toLowerCase() === String(colorNameOrObj).toLowerCase());
    return found || GILDAN_COLOR_PALETTE[0];
};

export const getUniqueDefaultShirtColor = (existingTeams = [], preferredColorName = null) => {
    const usedNames = existingTeams.map(t => t.shirtColorName || (t.shirtColor && t.shirtColor.name)).filter(Boolean);
    if (preferredColorName && !usedNames.includes(preferredColorName)) {
        const found = GILDAN_COLOR_PALETTE.find(c => c.name.toLowerCase() === preferredColorName.toLowerCase());
        if (found) return found;
    }
    const unused = GILDAN_COLOR_PALETTE.find(c => !usedNames.includes(c.name));
    return unused || GILDAN_COLOR_PALETTE[0];
};

export const getTeamShirtColor = (team, allTeams = []) => {
    if (!team) return GILDAN_COLOR_PALETTE[0];
    
    // 1. Si el equipo ya tiene shirtColorName guardado en Firestore
    if (team.shirtColorName) {
        const found = GILDAN_COLOR_PALETTE.find(c => c.name.toLowerCase() === team.shirtColorName.toLowerCase());
        if (found) return found;
    }

    // 2. Coincidencia por nombre de equipo Champions League
    let candidateColorName = null;
    const teamNameLower = (team.name || '').toLowerCase().trim();

    Object.values(PRESET_THEMES).forEach(presetList => {
        presetList.forEach(preset => {
            const pName = (preset.name || '').toLowerCase();
            if (pName && (teamNameLower.includes(pName) || pName.includes(teamNameLower))) {
                if (!candidateColorName) candidateColorName = preset.shirtColorName;
            }
        });
    });

    // Mapeo directo por palabra clave para Champions League
    if (!candidateColorName) {
        if (teamNameLower.includes('real madrid') || teamNameLower.includes('madrid')) candidateColorName = 'Azul Claro';
        else if (teamNameLower.includes('barcelona') || teamNameLower.includes('barça')) candidateColorName = 'Royal';
        else if (teamNameLower.includes('bayern') || teamNameLower.includes('munich')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('paris') || teamNameLower.includes('psg')) candidateColorName = 'Azul Marino';
        else if (teamNameLower.includes('manchester city') || teamNameLower.includes('city')) candidateColorName = 'Azul Celeste';
        else if (teamNameLower.includes('inter')) candidateColorName = 'Royal Jaspe';
        else if (teamNameLower.includes('milan')) candidateColorName = 'Rojo Cereza';
        else if (teamNameLower.includes('dortmund') || teamNameLower.includes('borussia')) candidateColorName = 'Amarillo Brillante';
        else if (teamNameLower.includes('arsenal')) candidateColorName = 'Coral';
        else if (teamNameLower.includes('atlético') || teamNameLower.includes('atletico')) candidateColorName = 'Naranja S.';
        else if (teamNameLower.includes('juventus') || teamNameLower.includes('juve')) candidateColorName = 'Negro';
        else if (teamNameLower.includes('benfica')) candidateColorName = 'Azalea';
        else if (teamNameLower.includes('porto')) candidateColorName = 'Royal';
    }

    // Comprobar colores utilizados en la misma liga
    const leagueTeams = (allTeams || []).filter(t => t.leagueId === team.leagueId);
    const usedColorNames = leagueTeams
        .filter(t => t.id !== team.id && t.shirtColorName)
        .map(t => t.shirtColorName);

    // Si el color representativo está libre en la liga, asignarlo
    if (candidateColorName && !usedColorNames.includes(candidateColorName)) {
        const found = GILDAN_COLOR_PALETTE.find(c => c.name.toLowerCase() === candidateColorName.toLowerCase());
        if (found) return found;
    }

    // Si no, buscar un color no usado en la liga
    const unusedColor = GILDAN_COLOR_PALETTE.find(c => !usedColorNames.includes(c.name));
    if (unusedColor) return unusedColor;

    // Fallback por índice
    const teamIndex = leagueTeams.findIndex(t => t.id === team.id);
    const fallbackIdx = (teamIndex >= 0 ? teamIndex : 0) % GILDAN_COLOR_PALETTE.length;
    return GILDAN_COLOR_PALETTE[fallbackIdx];
};
```

---

## 👕 Paso 2: Visualización en el Panel Admin (`src/components/LeagueCard.jsx`)

1. Importar `getTeamShirtColor`:
   ```javascript
   import { getTeamShirtColor } from '../config/constants';
   ```
2. Obtener el objeto de color dentro del `.map` de equipos:
   ```javascript
   {teams.map(team => {
       const shirtColor = getTeamShirtColor(team, teams);
       return (
           <div key={team.id} className="...">
               {/* Insignia de Color de Playera */}
               <span 
                   className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl border shadow-xs cursor-pointer" 
                   style={{ 
                       backgroundColor: shirtColor.hex, 
                       color: shirtColor.isLight ? '#000' : '#fff', 
                       borderColor: shirtColor.border 
                   }}
                   title={`Color de Playera: ${shirtColor.name} (Gildan)`}
                   onClick={() => handleEditTeamClick(team)}
               >
                   <span>👕</span>
                   <span>{shirtColor.name}</span>
               </span>
           </div>
       );
   })}
   ```

---

## 📝 Paso 3: Selector en el Modal de Edición (`src/components/EditTeamModal.jsx`)

1. Importar `GILDAN_COLOR_PALETTE` y `getTeamShirtColor`:
   ```javascript
   import { GILDAN_COLOR_PALETTE, getTeamShirtColor } from '../config/constants';
   ```
2. Inicializar el estado local del modal:
   ```javascript
   const initialColor = getTeamShirtColor(team);
   const [shirtColorName, setShirtColorName] = useState(initialColor.name);
   ```
3. Añadir el control `<select>` con vista previa del color en el cuerpo del modal:
   ```jsx
   <div className="space-y-1.5">
       <label className="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300">Color de Playera (Catálogo Gildan):</label>
       <div className="flex items-center gap-2">
           {/* Muestra circular de color */}
           <span 
               className="w-7 h-7 rounded-full border shadow-sm flex items-center justify-center shrink-0" 
               style={{ 
                   backgroundColor: GILDAN_COLOR_PALETTE.find(c => c.name === shirtColorName)?.hex || '#1565C0',
                   borderColor: GILDAN_COLOR_PALETTE.find(c => c.name === shirtColorName)?.border || '#0D47A1'
               }}
           >
               <span className="text-xs">👕</span>
           </span>

           <select 
               value={shirtColorName} 
               onChange={e => setShirtColorName(e.target.value)} 
               className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-slate-700 text-sm font-bold"
           >
               {GILDAN_COLOR_PALETTE.map(c => (
                   <option key={c.name} value={c.name}>{c.name}</option>
               ))}
           </select>
       </div>
   </div>
   ```
4. En la función `handleSave()`, pasar `shirtColorName` y `shirtColorHex`:
   ```javascript
   const selectedColorObj = GILDAN_COLOR_PALETTE.find(c => c.name === shirtColorName) || initialColor;
   onSave(team.id, name, logoUrl, selectedColorObj.name, selectedColorObj.hex);
   ```

---

## 💾 Paso 4: Guardado y Creación en Firestore (`src/App.jsx`)

Actualizar las funciones que crean o modifican equipos para persistir `shirtColorName` y `shirtColorHex`:

1. **`handleUpdateTeam`**:
   ```javascript
   const handleUpdateTeam = async (teamId, name, logoUrl, shirtColorName, shirtColorHex) => {
       const updateData = { name, logoUrl };
       if (shirtColorName && shirtColorHex) {
           updateData.shirtColorName = shirtColorName;
           updateData.shirtColorHex = shirtColorHex;
       }
       await updateDoc(doc(db, `.../teams`, teamId), updateData);
   };
   ```
2. **`handleAddTeam`**:
   ```javascript
   const assignedColor = getUniqueDefaultShirtColor(existingLeagueTeams);
   const newTeam = {
       id: teamId,
       name: `Nuevo Equipo ${existingLeagueTeams.length + 1}`,
       leagueId,
       logoUrl: '...',
       shirtColorName: assignedColor.name,
       shirtColorHex: assignedColor.hex
   };
   await setDoc(doc(db, `.../teams`, teamId), newTeam);
   ```

---

## 📄 Paso 5: Reporte PDF con Muestra de Color (`src/utils/pdfGenerator.js`)

En las funciones de generación de PDF (`generateTeamRostersPdf` o `generatePlayersByGroupPdf`):
1. Importar `getTeamShirtColor`.
2. Para cada equipo, obtener `const shirtColor = getTeamShirtColor(team, visibleTeams);`.
3. Dibujar la muestra circular del color Hex y su texto en el documento PDF usando `jsPDF`:
   ```javascript
   const hex = (shirtColor.hex || '#1565C0').replace('#', '');
   const r = parseInt(hex.substring(0, 2), 16);
   const g = parseInt(hex.substring(2, 4), 16);
   const b = parseInt(hex.substring(4, 6), 16);

   // Dibujar muestra de color
   doc.setFillColor(r, g, b);
   doc.setDrawColor(160, 160, 160);
   doc.circle(xOffset, yOffset, 1.8, 'FD');

   // Imprimir texto del color
   doc.setTextColor(30, 30, 30);
   doc.text(shirtColor.name, textXOffset, yOffset);
   ```

---

## ✅ Resumen de Verificación en la App de Secundaria
- Ejecutar `npm run build`.
- Verificar que cada equipo de Champions League muestre su insignia de playera representativa en Admin (`Plantillas & Equipos`).
- Editar cualquier equipo y cambiar su color de playera desde el desplegable Gildan.
- Generar cualquier reporte PDF de listas de equipos o grupos y confirmar que aparezca el color de la playera con su muestra circular e impreso en texto.
