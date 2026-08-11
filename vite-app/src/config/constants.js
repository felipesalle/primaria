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

export const PRESET_THEMES = {
    "Liga MX": [
        { name: "Club América", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/227.png" },
        { name: "Chivas Guadalajara", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/218.png" },
        { name: "Cruz Azul", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/216.png" },
        { name: "Tigres UANL", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/221.png" },
        { name: "Pumas UNAM", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/223.png" },
        { name: "Rayados de Monterrey", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/220.png" },
        { name: "Toluca FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/225.png" },
        { name: "Club León", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/7492.png" },
        { name: "Pachuca", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/222.png" },
        { name: "Santos Laguna", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/224.png" },
    ],
    "Premier League": [
        { name: "Manchester City", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png" },
        { name: "Liverpool FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png" },
        { name: "Arsenal FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png" },
        { name: "Manchester United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png" },
        { name: "Chelsea FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png" },
        { name: "Tottenham Hotspur", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png" },
        { name: "Newcastle United", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png" },
        { name: "Aston Villa", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/362.png" },
    ],
    "LaLiga Española": [
        { name: "Real Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png" },
        { name: "FC Barcelona", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png" },
        { name: "Atlético de Madrid", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png" },
        { name: "Sevilla FC", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png" },
        { name: "Valencia CF", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/94.png" },
        { name: "Athletic Bilbao", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png" },
        { name: "Real Sociedad", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/89.png" },
        { name: "Real Betis", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/244.png" },
    ],
    "Serie A Italiana": [
        { name: "Inter de Milán", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png" },
        { name: "AC Milan", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png" },
        { name: "Juventus", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png" },
        { name: "AS Roma", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png" },
        { name: "Napoli", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/114.png" },
        { name: "Lazio", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/112.png" },
        { name: "Fiorentina", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/109.png" },
        { name: "Atalanta", logoUrl: "https://a.espncdn.com/i/teamlogos/soccer/500/105.png" },
    ],
    "Estados de México": [
        { name: "CDMX", logoUrl: "https://ui-avatars.com/api/?name=CDMX&background=CE0E2D&color=fff&rounded=true&font-size=0.4" },
        { name: "Jalisco", logoUrl: "https://ui-avatars.com/api/?name=Jalisco&background=0056B3&color=fff&rounded=true&font-size=0.35" },
        { name: "Nuevo León", logoUrl: "https://ui-avatars.com/api/?name=Nuevo+Leon&background=101097&color=fff&rounded=true&font-size=0.3" },
        { name: "Chiapas", logoUrl: "https://ui-avatars.com/api/?name=Chiapas&background=008055&color=fff&rounded=true&font-size=0.35" },
        { name: "Yucatán", logoUrl: "https://ui-avatars.com/api/?name=Yucatan&background=D97706&color=fff&rounded=true&font-size=0.35" },
        { name: "Puebla", logoUrl: "https://ui-avatars.com/api/?name=Puebla&background=4F46E5&color=fff&rounded=true&font-size=0.35" },
        { name: "Veracruz", logoUrl: "https://ui-avatars.com/api/?name=Veracruz&background=059669&color=fff&rounded=true&font-size=0.3" },
        { name: "Guanajuato", logoUrl: "https://ui-avatars.com/api/?name=Guanajuato&background=B91C1C&color=fff&rounded=true&font-size=0.3" },
    ],
    "Selecciones (Países)": [
        { name: "México", logoUrl: "https://flagcdn.com/w160/mx.png" },
        { name: "Brasil", logoUrl: "https://flagcdn.com/w160/br.png" },
        { name: "Argentina", logoUrl: "https://flagcdn.com/w160/ar.png" },
        { name: "Francia", logoUrl: "https://flagcdn.com/w160/fr.png" },
        { name: "España", logoUrl: "https://flagcdn.com/w160/es.png" },
        { name: "Alemania", logoUrl: "https://flagcdn.com/w160/de.png" },
        { name: "Inglaterra", logoUrl: "https://flagcdn.com/w160/gb-eng.png" },
        { name: "Italia", logoUrl: "https://flagcdn.com/w160/it.png" },
    ],
    "Equipos NBA": [
        { name: "Los Angeles Lakers", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
        { name: "Chicago Bulls", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
        { name: "Boston Celtics", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
        { name: "Golden State Warriors", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png" },
        { name: "Miami Heat", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
        { name: "Dallas Mavericks", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
        { name: "Phoenix Suns", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
        { name: "Brooklyn Nets", logoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
    ]
};

export const DEFAULT_TEAMS_PRESETS = [
    { name: "Real Madrid", logoUrl: "https://crests.football-data.org/86.png" },
    { name: "FC Barcelona", logoUrl: "https://crests.football-data.org/81.png" },
    { name: "Bayern München", logoUrl: "https://crests.football-data.org/5.png" },
    { name: "Manchester City", logoUrl: "https://crests.football-data.org/65.png" },
    { name: "Paris Saint-Germain", logoUrl: "https://crests.football-data.org/524.png" },
    { name: "Liverpool FC", logoUrl: "https://crests.football-data.org/64.png" },
    { name: "Juventus", logoUrl: "https://crests.football-data.org/109.png" },
    { name: "Inter Milan", logoUrl: "https://crests.football-data.org/108.png" },
    { name: "Arsenal", logoUrl: "https://crests.football-data.org/57.png" },
    { name: "Atletico Madrid", logoUrl: "https://crests.football-data.org/78.png" },
    { name: "Borussia Dortmund", logoUrl: "https://crests.football-data.org/4.png" },
    { name: "AC Milan", logoUrl: "https://crests.football-data.org/98.png" },
    { name: "Chelsea FC", logoUrl: "https://crests.football-data.org/61.png" },
    { name: "Bayer Leverkusen", logoUrl: "https://crests.football-data.org/3.png" },
    { name: "Manchester United", logoUrl: "https://crests.football-data.org/66.png" },
    { name: "Benfica", logoUrl: "https://crests.football-data.org/1903.png" }
];
