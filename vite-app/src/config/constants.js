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

// Colores Euro Cotton (100% Algodón) disponibles en tienda (marcados con resaltador amarillo)
export const EURO_COTTON_COLOR_PALETTE = [
    { name: "Jaspe", hex: "#9EA2A8", border: "#84888E", isLight: true },
    { name: "Negro", hex: "#121214", border: "#000000", isLight: false },
    { name: "Marino", hex: "#141F36", border: "#0A111F", isLight: false },
    { name: "Rey", hex: "#1A4ABB", border: "#103282", isLight: false },
    { name: "Turquesa", hex: "#0096D6", border: "#0073A4", isLight: false },
    { name: "Aqua", hex: "#00BCD4", border: "#0097A7", isLight: false },
    { name: "Perry", hex: "#008B99", border: "#006772", isLight: false },
    { name: "Bandera", hex: "#15783E", border: "#0C4F28", isLight: false },
    { name: "Amarillo", hex: "#F5BA13", border: "#C99608", isLight: true },
    { name: "Canario", hex: "#FFDE00", border: "#D4B800", isLight: true },
    { name: "Rojo", hex: "#D62226", border: "#A31417", isLight: false },
    { name: "Cherry", hex: "#9B1B30", border: "#751222", isLight: false },
    { name: "Heliconia", hex: "#D81B74", border: "#A81258", isLight: false },
    { name: "Salmón", hex: "#E85D65", border: "#C44047", isLight: false },
    { name: "Flavina", hex: "#E5FF00", border: "#B8CC00", isLight: true }
];

export const GILDAN_COLOR_PALETTE = EURO_COTTON_COLOR_PALETTE;

// Mapeo de colores no disponibles o antiguos hacia los 15 disponibles en tienda
export const GILDAN_TO_EURO_COTTON_MAP = {
    // Colores Euro Cotton no surtidos en tienda
    "oxford": "Negro",
    "carbón": "Negro",
    "carbon": "Negro",
    "petróleo": "Marino",
    "petroleo": "Marino",
    "perla": "Jaspe",
    "celeste": "Aqua",
    "menta": "Aqua",
    "limón": "Flavina",
    "limon": "Flavina",
    "verde neón": "Flavina",
    "verde neon": "Flavina",
    "botella": "Bandera",
    "militar": "Perry",
    "tabaco": "Negro",
    "kaki": "Jaspe",
    "hueso": "Jaspe",
    "naranja": "Salmón",
    "vino": "Cherry",
    "morado": "Rey",
    "rosa": "Heliconia",

    // Colores antiguos de Gildan
    "amarillo brillante": "Amarillo",
    "oro": "Amarillo",
    "royal": "Rey",
    "royal jaspe": "Rey",
    "azul marino": "Marino",
    "azul marino jaspe": "Marino",
    "azul celeste": "Aqua",
    "azul claro": "Aqua",
    "verde césped": "Bandera",
    "verde cesped": "Bandera",
    "verde pasto": "Bandera",
    "verde irlandés": "Flavina",
    "verde irlandes": "Flavina",
    "rojo cereza": "Cherry",
    "púrpura": "Rey",
    "purpura": "Rey",
    "púrpura jaspe": "Rey",
    "purpura jaspe": "Rey",
    "grafito jaspe": "Negro",
    "gris jaspe": "Jaspe",
    "gris jaspe rs": "Jaspe",
    "jaspe oscuro": "Negro",
    "arena": "Jaspe",
    "jade": "Perry",
    "turquesa antiguo": "Aqua",
    "naranja s.": "Salmón",
    "naranja jaspe": "Salmón",
    "coral": "Salmón",
    "azalea": "Heliconia",
    "palo de rosa": "Heliconia",
    "rosa seguridad": "Heliconia",
    "rosa tropical": "Heliconia",
    "marrón": "Negro",
    "marron": "Negro",
    "chocolate": "Negro",
    "verde militar": "Perry",
    "bosque": "Bandera",
    "índigo": "Marino",
    "indigo": "Marino",
    "verde seguridad": "Flavina"
};

export const getShirtColorObj = (colorNameOrObj) => {
    if (!colorNameOrObj) return EURO_COTTON_COLOR_PALETTE[0];
    if (typeof colorNameOrObj === 'object' && colorNameOrObj.hex) return colorNameOrObj;
    const rawName = String(colorNameOrObj).toLowerCase().trim();
    let found = EURO_COTTON_COLOR_PALETTE.find(c => c.name.toLowerCase() === rawName);
    if (!found && GILDAN_TO_EURO_COTTON_MAP[rawName]) {
        const mappedName = GILDAN_TO_EURO_COTTON_MAP[rawName];
        found = EURO_COTTON_COLOR_PALETTE.find(c => c.name.toLowerCase() === mappedName.toLowerCase());
    }
    return found || EURO_COTTON_COLOR_PALETTE[0];
};

export const getUniqueDefaultShirtColor = (existingTeams = [], preferredColorName = null) => {
    const usedNames = existingTeams.map(t => t.shirtColorName || (t.shirtColor && t.shirtColor.name)).filter(Boolean);
    if (preferredColorName && !usedNames.includes(preferredColorName)) {
        const found = getShirtColorObj(preferredColorName);
        if (found) return found;
    }
    const unused = EURO_COTTON_COLOR_PALETTE.find(c => !usedNames.includes(c.name));
    return unused || EURO_COTTON_COLOR_PALETTE[0];
};

export const getTeamShirtColor = (team, allTeams = []) => {
    if (!team) return EURO_COTTON_COLOR_PALETTE[0];
    
    // 1. If explicit shirtColorName is set on team, resolve it (with fallback to available colors)
    if (team.shirtColorName) {
        return getShirtColorObj(team.shirtColorName);
    }

    // 2. Scan presets for representative color
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

    // Keyword fallbacks for common team names (Available Euro Cotton colors)
    if (!candidateColorName) {
        if (teamNameLower.includes('américa') || teamNameLower.includes('america')) candidateColorName = 'Amarillo';
        else if (teamNameLower.includes('chivas') || teamNameLower.includes('guadalajara')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('cruz azul')) candidateColorName = 'Marino';
        else if (teamNameLower.includes('tigres')) candidateColorName = 'Canario';
        else if (teamNameLower.includes('pumas')) candidateColorName = 'Jaspe';
        else if (teamNameLower.includes('real madrid') || teamNameLower.includes('madrid')) candidateColorName = 'Aqua';
        else if (teamNameLower.includes('barcelona') || teamNameLower.includes('barça')) candidateColorName = 'Rey';
        else if (teamNameLower.includes('atlético') || teamNameLower.includes('atletico')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('betis')) candidateColorName = 'Bandera';
        else if (teamNameLower.includes('villarreal')) candidateColorName = 'Amarillo';
        else if (teamNameLower.includes('lakers')) candidateColorName = 'Amarillo';
        else if (teamNameLower.includes('bulls')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('celtics')) candidateColorName = 'Bandera';
        else if (teamNameLower.includes('warriors')) candidateColorName = 'Rey';
        else if (teamNameLower.includes('heat')) candidateColorName = 'Negro';
        else if (teamNameLower.includes('knicks')) candidateColorName = 'Salmón';
        else if (teamNameLower.includes('76ers') || teamNameLower.includes('sixers')) candidateColorName = 'Rey';
        else if (teamNameLower.includes('raptors')) candidateColorName = 'Cherry';
        else if (teamNameLower.includes('cavaliers') || teamNameLower.includes('cavs')) candidateColorName = 'Cherry';
        else if (teamNameLower.includes('pistons')) candidateColorName = 'Rey';
        else if (teamNameLower.includes('pacers')) candidateColorName = 'Amarillo';
        else if (teamNameLower.includes('bucks')) candidateColorName = 'Perry';
        else if (teamNameLower.includes('hawks')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('hornets')) candidateColorName = 'Aqua';
        else if (teamNameLower.includes('magic')) candidateColorName = 'Turquesa';
        else if (teamNameLower.includes('wizards')) candidateColorName = 'Marino';
        else if (teamNameLower.includes('nuggets')) candidateColorName = 'Marino';
        else if (teamNameLower.includes('timberwolves') || teamNameLower.includes('wolves')) candidateColorName = 'Marino';
        else if (teamNameLower.includes('thunder')) candidateColorName = 'Turquesa';
        else if (teamNameLower.includes('trail blazers') || teamNameLower.includes('blazers')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('jazz')) candidateColorName = 'Rey';
        else if (teamNameLower.includes('clippers')) candidateColorName = 'Marino';
        else if (teamNameLower.includes('kings')) candidateColorName = 'Heliconia';
        else if (teamNameLower.includes('rockets')) candidateColorName = 'Rojo';
        else if (teamNameLower.includes('grizzlies')) candidateColorName = 'Turquesa';
        else if (teamNameLower.includes('pelicans')) candidateColorName = 'Jaspe';
        else if (teamNameLower.includes('spurs')) candidateColorName = 'Negro';
        else if (teamNameLower.includes('oaxaca')) candidateColorName = 'Perry';
        else if (teamNameLower.includes('méxico') || teamNameLower.includes('mexico')) candidateColorName = 'Bandera';
        else if (teamNameLower.includes('brasil')) candidateColorName = 'Canario';
        else if (teamNameLower.includes('argentina')) candidateColorName = 'Aqua';
    }

    // Determine colors already assigned to other teams in the same league
    const leagueTeams = (allTeams || []).filter(t => t.leagueId === team.leagueId);
    const usedColorNames = leagueTeams
        .filter(t => t.id !== team.id && t.shirtColorName)
        .map(t => getShirtColorObj(t.shirtColorName).name);

    // If candidate color is not used in this league yet, use it!
    if (candidateColorName && !usedColorNames.includes(candidateColorName)) {
        return getShirtColorObj(candidateColorName);
    }

    // If candidate color is taken or null, find an unused color in palette for this league
    const unusedColor = EURO_COTTON_COLOR_PALETTE.find(c => !usedColorNames.includes(c.name));
    if (unusedColor) return unusedColor;

    // Fallback by team index
    const teamIndex = leagueTeams.findIndex(t => t.id === team.id);
    const fallbackIdx = (teamIndex >= 0 ? teamIndex : 0) % EURO_COTTON_COLOR_PALETTE.length;
    return EURO_COTTON_COLOR_PALETTE[fallbackIdx];
};

export const PRESET_THEMES = {
    "Liga MX": [
        { name: "Club América", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/227.png", shirtColorName: "Amarillo", shirtColorHex: "#F5BA13" },
        { name: "Chivas Guadalajara", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/218.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Cruz Azul", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/216.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Tigres UANL", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/221.png", shirtColorName: "Canario", shirtColorHex: "#FFDE00" },
        { name: "Pumas UNAM", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/223.png", shirtColorName: "Jaspe", shirtColorHex: "#9EA2A8" },
        { name: "Rayados de Monterrey", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/220.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Toluca FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/225.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Club León", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/7492.png", shirtColorName: "Bandera", shirtColorHex: "#15783E" },
        { name: "Pachuca", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/222.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Santos Laguna", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/224.png", shirtColorName: "Flavina", shirtColorHex: "#E5FF00" },
    ],
    "Premier League": [
        { name: "Manchester City", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Liverpool FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Arsenal FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Manchester United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png", shirtColorName: "Salmón", shirtColorHex: "#E85D65" },
        { name: "Chelsea FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Tottenham Hotspur", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Newcastle United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png", shirtColorName: "Negro", shirtColorHex: "#121214" },
        { name: "Aston Villa", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/362.png", shirtColorName: "Heliconia", shirtColorHex: "#D81B74" },
    ],
    "LaLiga Española": [
        { name: "Real Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "FC Barcelona", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Atlético de Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Sevilla FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Villarreal CF", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/102.png", shirtColorName: "Amarillo", shirtColorHex: "#F5BA13" },
        { name: "Valencia CF", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/94.png", shirtColorName: "Salmón", shirtColorHex: "#E85D65" },
        { name: "Athletic Bilbao", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png", shirtColorName: "Heliconia", shirtColorHex: "#D81B74" },
        { name: "Real Sociedad", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/89.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "Real Betis", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/244.png", shirtColorName: "Bandera", shirtColorHex: "#15783E" },
    ],
    "Serie A Italiana": [
        { name: "Inter de Milán", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "AC Milan", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Juventus", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png", shirtColorName: "Negro", shirtColorHex: "#121214" },
        { name: "AS Roma", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Napoli", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/114.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "Lazio", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/112.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Fiorentina", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/109.png", shirtColorName: "Heliconia", shirtColorHex: "#D81B74" },
        { name: "Atalanta", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/105.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
    ],
    "Estados de México": [
        { name: "CDMX", logoUrl: "./escudos/cdmx.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Jalisco", logoUrl: "./escudos/jalisco.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Nuevo León", logoUrl: "./escudos/nuevo_leon.png", shirtColorName: "Amarillo", shirtColorHex: "#F5BA13" },
        { name: "Chiapas", logoUrl: "./escudos/chiapas.png", shirtColorName: "Bandera", shirtColorHex: "#15783E" },
        { name: "Yucatán", logoUrl: "./escudos/yucatan.png", shirtColorName: "Salmón", shirtColorHex: "#E85D65" },
        { name: "Puebla", logoUrl: "./escudos/puebla.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Veracruz", logoUrl: "./escudos/veracruz.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "Guanajuato", logoUrl: "./escudos/guanajuato.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Oaxaca", logoUrl: "./escudos/oaxaca.png", shirtColorName: "Perry", shirtColorHex: "#008B99" },
    ],
    "Selecciones (Países)": [
        { name: "México", logoUrl: "https://flagcdn.com/w160/mx.png", shirtColorName: "Bandera", shirtColorHex: "#15783E" },
        { name: "Brasil", logoUrl: "https://flagcdn.com/w160/br.png", shirtColorName: "Canario", shirtColorHex: "#FFDE00" },
        { name: "Argentina", logoUrl: "https://flagcdn.com/w160/ar.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Francia", logoUrl: "https://flagcdn.com/w160/fr.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "España", logoUrl: "https://flagcdn.com/w160/es.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Alemania", logoUrl: "https://flagcdn.com/w160/de.png", shirtColorName: "Negro", shirtColorHex: "#121214" },
        { name: "Inglaterra", logoUrl: "https://flagcdn.com/w160/gb-eng.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Italia", logoUrl: "https://flagcdn.com/w160/it.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
    ],
    "Equipos NBA": [
        { name: "Boston Celtics", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png", shirtColorName: "Bandera", shirtColorHex: "#15783E" },
        { name: "Brooklyn Nets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png", shirtColorName: "Negro", shirtColorHex: "#121214" },
        { name: "New York Knicks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/nyk.png", shirtColorName: "Salmón", shirtColorHex: "#E85D65" },
        { name: "Philadelphia 76ers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Toronto Raptors", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Chicago Bulls", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Cleveland Cavaliers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png", shirtColorName: "Cherry", shirtColorHex: "#9B1B30" },
        { name: "Detroit Pistons", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/det.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Indiana Pacers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png", shirtColorName: "Amarillo", shirtColorHex: "#F5BA13" },
        { name: "Milwaukee Bucks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png", shirtColorName: "Perry", shirtColorHex: "#008B99" },
        { name: "Atlanta Hawks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Charlotte Hornets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Miami Heat", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png", shirtColorName: "Negro", shirtColorHex: "#121214" },
        { name: "Orlando Magic", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "Washington Wizards", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/was.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Denver Nuggets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/den.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Minnesota Timberwolves", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/min.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Oklahoma City Thunder", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "Portland Trail Blazers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/por.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Utah Jazz", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/uta.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "Golden State Warriors", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png", shirtColorName: "Rey", shirtColorHex: "#1A4ABB" },
        { name: "LA Clippers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png", shirtColorName: "Marino", shirtColorHex: "#141F36" },
        { name: "Los Angeles Lakers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png", shirtColorName: "Amarillo", shirtColorHex: "#F5BA13" },
        { name: "Phoenix Suns", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png", shirtColorName: "Salmón", shirtColorHex: "#E85D65" },
        { name: "Sacramento Kings", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png", shirtColorName: "Heliconia", shirtColorHex: "#D81B74" },
        { name: "Dallas Mavericks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png", shirtColorName: "Aqua", shirtColorHex: "#00BCD4" },
        { name: "Houston Rockets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png", shirtColorName: "Rojo", shirtColorHex: "#D62226" },
        { name: "Memphis Grizzlies", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png", shirtColorName: "Turquesa", shirtColorHex: "#0096D6" },
        { name: "New Orleans Pelicans", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/nop.png", shirtColorName: "Jaspe", shirtColorHex: "#9EA2A8" },
        { name: "San Antonio Spurs", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png", shirtColorName: "Negro", shirtColorHex: "#121214" }
    ]
};

export const DEFAULT_TEAMS_PRESETS = PRESET_THEMES["Premier League"];
