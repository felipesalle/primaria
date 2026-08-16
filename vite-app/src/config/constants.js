export const APP_LEVEL_NAME = '🏫 PRIMARIA';
export const TELEGRAM_BOT_TOKEN = '8314025136:AAG3P1AoU1rExMIeTEsE_1YDxc-Vj3r9Tac';
export const TELEGRAM_CHAT_ID = '6740086';

export const sendTelegramNotification = async (message, userEmail) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    try {
        const fullText = `📌 [TORNEOS ${APP_LEVEL_NAME}]\n👤 Usuario: ${userEmail || 'Desconocido'}\n\n${message}`;
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: fullText
            })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            console.error("Error respuesta Telegram:", data);
        }
    } catch (e) {
        console.error("Error enviando notificación a Telegram:", e);
    }
};

export const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const formatLocalDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getFridayForDate = (dateStr) => {
    if (!dateStr) return dateStr;
    const d = parseLocalDate(dateStr);
    const day = d.getDay();
    const diffToFriday = 5 - day;
    d.setDate(d.getDate() + diffToFriday);
    return formatLocalDate(d);
};

export const HOLIDAY_CTE_DATES = [
    // 2025-2026
    "2025-09-26", "2025-10-31", "2025-11-14", "2025-11-28", "2025-12-26", "2026-01-02",
    "2026-01-30", "2026-02-27", "2026-03-13", "2026-03-27", "2026-04-03", "2026-04-24", "2026-05-29", "2026-06-26", "2026-07-03",
    // 2026-2027 (Oficial SEP Calendario 185 Días: CTE + Registro de Calificaciones + Vacaciones)
    "2026-09-25", "2026-10-30", "2026-11-13", "2026-11-27", "2026-12-25", "2027-01-01",
    "2027-01-29", "2027-02-26", "2027-03-05", "2027-03-26", "2027-04-02", "2027-04-30", "2027-05-28", "2027-06-25", "2027-07-02"
];

export const isHolidayOrCTE = (dateString) => {
    return HOLIDAY_CTE_DATES.includes(dateString);
};

export const sortLeagues = (a, b) => {
    const isAFut = a.sport === 'Fútbol';
    const isBFut = b.sport === 'Fútbol';
    if (isAFut && !isBFut) return -1;
    if (!isAFut && isBFut) return 1;
    return a.name.localeCompare(b.name);
};

export const getSportTerms = (sport) => {
    const isPointsBased = sport === 'Básquetbol' || sport === 'Voleibol';
    return {
        unit: isPointsBased ? 'puntos' : 'goles',
        unitShort: isPointsBased ? 'PTS' : 'GOL',
        scorerHeader: isPointsBased ? 'Puntos' : 'Goles',
        scorerSingular: isPointsBased ? 'Anotador' : 'Goleador',
        scorerPlural: isPointsBased ? 'Anotadores' : 'Goleadores',
        addHomeBtn: isPointsBased ? '+ Anotador Local' : '+ Goleador Local',
        addAwayBtn: isPointsBased ? '+ Anotador Visitante' : '+ Goleador Visitante',
        noScorersMsg: isPointsBased ? 'No hay anotadores registrados.' : 'No hay goleadores registrados.',
    };
};

export const getSportScoringInfo = (sport) => {
    switch (sport) {
        case 'Fútbol': return { unit: 'goles', emoji: '⚽', scorerTitle: 'Máximo Goleador', color: '#059669' };
        case 'Básquetbol': return { unit: 'puntos', emoji: '🏀', scorerTitle: 'Máximo Anotador', color: '#c2410c' };
        case 'Tocho': return { unit: 'touchdowns', emoji: '🏈', scorerTitle: 'Máximo Anotador', color: '#be123c' };
        case 'Voleibol': return { unit: 'puntos', emoji: '🏐', scorerTitle: 'Máximo Anotador', color: '#0d9488' };
        default: return { unit: 'puntos', emoji: '🏆', scorerTitle: 'Máximo Anotador', color: '#101097' };
    }
};

export const CLUBES_CHAMPIONS = [
    { name: "Real Madrid", logo: "https://crests.football-data.org/86.png" },
    { name: "FC Barcelona", logo: "https://crests.football-data.org/81.png" },
    { name: "Bayern München", logo: "https://crests.football-data.org/5.png" },
    { name: "Manchester City", logo: "https://crests.football-data.org/65.png" },
    { name: "Paris Saint-Germain", logo: "https://crests.football-data.org/524.png" },
    { name: "Liverpool FC", logo: "https://crests.football-data.org/64.png" },
    { name: "Juventus", logo: "https://crests.football-data.org/109.png" },
    { name: "Inter Milan", logo: "https://crests.football-data.org/108.png" },
    { name: "Arsenal", logo: "https://crests.football-data.org/57.png" },
    { name: "Atletico Madrid", logo: "https://crests.football-data.org/78.png" },
    { name: "Borussia Dortmund", logo: "https://crests.football-data.org/4.png" },
    { name: "AC Milan", logo: "https://crests.football-data.org/98.png" },
    { name: "Chelsea FC", logo: "https://crests.football-data.org/61.png" },
    { name: "Bayer Leverkusen", logo: "https://crests.football-data.org/3.png" },
    { name: "Manchester United", logo: "https://crests.football-data.org/66.png" },
    { name: "Benfica", logo: "https://crests.football-data.org/1903.png" }
];

export const SPORTS_HERO_PRESETS = {
    'Fútbol': {
        title: 'Liga de Fútbol Primaria',
        subtitle: 'Torneo Oficial de Fútbol de Primaria Colegio La Salle Tuxtla',
        badge: 'Fútbol La Salle',
        bannerImg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        colorTheme: 'from-emerald-600 to-teal-800'
    },
    'Básquetbol': {
        title: 'Liga de Básquetbol Primaria',
        subtitle: 'Campeonato de Baloncesto de Primaria Colegio La Salle Tuxtla',
        badge: 'Básquetbol La Salle',
        bannerImg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
        colorTheme: 'from-amber-600 to-orange-800'
    },
    'Tocho': {
        title: 'Liga de Tocho Flag Primaria',
        subtitle: 'Campeonato de Tocho Flag La Salle Tuxtla',
        badge: 'Tocho Flag La Salle',
        bannerImg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=1200&q=80',
        colorTheme: 'from-red-600 to-rose-800'
    },
    'Voleibol': {
        title: 'Liga de Voleibol Primaria',
        subtitle: 'Torneo de Voleibol La Salle Tuxtla',
        badge: 'Voleibol La Salle',
        bannerImg: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
        colorTheme: 'from-cyan-600 to-blue-800'
    }
};

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

export const PRESET_THEMES = {
    "Liga MX": [
        { name: "Club América", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/227.png", shirtColorName: "Amarillo Brillante", shirtColorHex: "#FFD700" },
        { name: "Chivas Guadalajara", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/218.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Cruz Azul", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/216.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "Tigres UANL", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/221.png", shirtColorName: "Oro", shirtColorHex: "#FFA500" },
        { name: "Pumas UNAM", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/223.png", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
        { name: "Rayados de Monterrey", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/220.png", shirtColorName: "Azul Marino Jaspe", shirtColorHex: "#1A237E" },
        { name: "Toluca FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/225.png", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
        { name: "Club León", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/7492.png", shirtColorName: "Verde Césped", shirtColorHex: "#4CAF50" },
        { name: "Pachuca", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/222.png", shirtColorName: "Azul Claro", shirtColorHex: "#81D4FA" },
        { name: "Santos Laguna", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/224.png", shirtColorName: "Verde Irlandés", shirtColorHex: "#00E676" },
    ],
    "Premier League": [
        { name: "Manchester City", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
        { name: "Liverpool FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Arsenal FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
        { name: "Manchester United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png", shirtColorName: "Coral", shirtColorHex: "#FF6F61" },
        { name: "Chelsea FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "Tottenham Hotspur", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
        { name: "Newcastle United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png", shirtColorName: "Negro", shirtColorHex: "#000000" },
        { name: "Aston Villa", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/362.png", shirtColorName: "Púrpura", shirtColorHex: "#4A148C" },
    ],
    "LaLiga Española": [
        { name: "Real Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png", shirtColorName: "Azul Claro", shirtColorHex: "#81D4FA" },
        { name: "FC Barcelona", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "Atlético de Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Sevilla FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
        { name: "Valencia CF", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/94.png", shirtColorName: "Naranja", shirtColorHex: "#FF6600" },
        { name: "Athletic Bilbao", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png", shirtColorName: "Naranja S.", shirtColorHex: "#FF4500" },
        { name: "Real Sociedad", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/89.png", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
        { name: "Real Betis", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/244.png", shirtColorName: "Verde Pasto", shirtColorHex: "#2E7D32" },
    ],
    "Serie A Italiana": [
        { name: "Inter de Milán", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "AC Milan", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Juventus", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png", shirtColorName: "Negro", shirtColorHex: "#000000" },
        { name: "AS Roma", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
        { name: "Napoli", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/114.png", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
        { name: "Lazio", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/112.png", shirtColorName: "Azul Claro", shirtColorHex: "#81D4FA" },
        { name: "Fiorentina", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/109.png", shirtColorName: "Púrpura", shirtColorHex: "#4A148C" },
        { name: "Atalanta", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/105.png", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
    ],
    "Estados de México": [
        { name: "CDMX", logoUrl: "https://ui-avatars.com/api/?name=CDMX&background=CE0E2D&color=fff&rounded=true&font-size=0.4", shirtColorName: "Rojo Cereza", shirtColorHex: "#990000" },
        { name: "Jalisco", logoUrl: "https://ui-avatars.com/api/?name=Jalisco&background=0056B3&color=fff&rounded=true&font-size=0.35", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
        { name: "Nuevo León", logoUrl: "https://ui-avatars.com/api/?name=Nuevo+Leon&background=101097&color=fff&rounded=true&font-size=0.3", shirtColorName: "Oro", shirtColorHex: "#FFA500" },
        { name: "Chiapas", logoUrl: "https://ui-avatars.com/api/?name=Chiapas&background=008055&color=fff&rounded=true&font-size=0.35", shirtColorName: "Verde Irlandés", shirtColorHex: "#00E676" },
        { name: "Yucatán", logoUrl: "https://ui-avatars.com/api/?name=Yucatan&background=D97706&color=fff&rounded=true&font-size=0.35", shirtColorName: "Naranja", shirtColorHex: "#FF6600" },
        { name: "Puebla", logoUrl: "https://ui-avatars.com/api/?name=Puebla&background=4F46E5&color=fff&rounded=true&font-size=0.35", shirtColorName: "Azul Claro", shirtColorHex: "#81D4FA" },
        { name: "Veracruz", logoUrl: "https://ui-avatars.com/api/?name=Veracruz&background=059669&color=fff&rounded=true&font-size=0.3", shirtColorName: "Verde Césped", shirtColorHex: "#4CAF50" },
        { name: "Guanajuato", logoUrl: "https://ui-avatars.com/api/?name=Guanajuato&background=B91C1C&color=fff&rounded=true&font-size=0.3", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
    ],
    "Selecciones (Países)": [
        { name: "México", logoUrl: "https://flagcdn.com/w160/mx.png", shirtColorName: "Verde Césped", shirtColorHex: "#4CAF50" },
        { name: "Brasil", logoUrl: "https://flagcdn.com/w160/br.png", shirtColorName: "Amarillo Brillante", shirtColorHex: "#FFD700" },
        { name: "Argentina", logoUrl: "https://flagcdn.com/w160/ar.png", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
        { name: "Francia", logoUrl: "https://flagcdn.com/w160/fr.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "España", logoUrl: "https://flagcdn.com/w160/es.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Alemania", logoUrl: "https://flagcdn.com/w160/de.png", shirtColorName: "Negro", shirtColorHex: "#000000" },
        { name: "Inglaterra", logoUrl: "https://flagcdn.com/w160/gb-eng.png", shirtColorName: "Azul Marino", shirtColorHex: "#001E61" },
        { name: "Italia", logoUrl: "https://flagcdn.com/w160/it.png", shirtColorName: "Royal Jaspe", shirtColorHex: "#2979FF" },
    ],
    "Equipos NBA": [
        { name: "Los Angeles Lakers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png", shirtColorName: "Púrpura", shirtColorHex: "#4A148C" },
        { name: "Chicago Bulls", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png", shirtColorName: "Rojo", shirtColorHex: "#D32F2F" },
        { name: "Boston Celtics", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png", shirtColorName: "Verde Césped", shirtColorHex: "#4CAF50" },
        { name: "Golden State Warriors", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png", shirtColorName: "Royal", shirtColorHex: "#1565C0" },
        { name: "Miami Heat", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png", shirtColorName: "Negro", shirtColorHex: "#000000" },
        { name: "Dallas Mavericks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png", shirtColorName: "Azul Celeste", shirtColorHex: "#29B6F6" },
        { name: "Phoenix Suns", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png", shirtColorName: "Naranja", shirtColorHex: "#FF6600" },
        { name: "Brooklyn Nets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png", shirtColorName: "Grafito Jaspe", shirtColorHex: "#616161" },
    ]
};

export const DEFAULT_TEAMS_PRESETS = PRESET_THEMES["Premier League"];
