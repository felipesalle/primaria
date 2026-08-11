# 📱 Guía de Implementación: Resumen de la Jornada para Facebook y Redes Sociales

Esta guía contiene el código exacto e instrucciones paso a paso para integrar el **Generador de Resúmenes para Facebook / Redes Sociales** en los sistemas de **Primaria** y **Preparatoria**.

---

## 💡 ¿Qué incluye esta funcionalidad?

1. **Póster Gráfico HD para Redes Sociales (`printFacebookSummaryWindow`):**
   - Abre un diseño profesional en una nueva pestaña listo para exportar a PDF o capturar como imagen/infografía.
   - Fondo con degradado dinámico según el deporte activo (Fútbol, Básquetbol, Voleibol, Tocho).
   - Incluye logo institucional, escudos oficiales de los equipos, marcadores, máximos anotadores y la próxima jornada.

2. **Copiado de Texto Formateado (`copyFacebookSummaryText`):**
   - Copia directamente al portapapeles un resumen estructurado en texto plano con emojis, resultados por liga, goleadores/anotadores de la fecha y lista de próximos partidos.
   - Agrega hashtags institucionales automáticamente (`#LigasLaSalle #Primaria` o `#Preparatoria`).

---

## 🛠️ Paso 1: Configurar las Funciones de Lógica JavaScript

Agrega las siguientes 3 funciones dentro de tu componente principal de administración (o en la sección de funciones auxiliares dentro del `<script type="text/babel">`):

```javascript
// --- 1. Obtener Datos Filtrados de la Jornada ---
const getFacebookSummaryData = (visMatches, visLeagues, visTeams, visPlayers, selectedDate) => {
    const sortedLeagues = [...visLeagues].sort(sortLeagues);
    
    // Partidos que ya tienen marcador registrado (jugados)
    const allPlayedMatches = visMatches.filter(m => m.scoreHome !== null && m.scoreHome !== undefined);
    
    // Ordenar fechas jugadas de forma cronológica
    const playedDates = [...new Set(allPlayedMatches.map(m => m.date))].filter(Boolean).sort();
    
    // Determinar la fecha objetivo (la fecha seleccionada o la última fecha jugada)
    const targetDate = selectedDate || (playedDates.length > 0 ? playedDates[playedDates.length - 1] : null);

    // Filtrar partidos de la fecha objetivo
    const playedMatches = targetDate 
        ? allPlayedMatches.filter(m => m.date === targetDate)
        : allPlayedMatches;

    // Agrupar resultados por liga
    const leagueResultsMap = [];
    sortedLeagues.forEach(league => {
        const lMatches = playedMatches.filter(m => m.leagueId === league.id);
        if (lMatches.length > 0) {
            leagueResultsMap.push({
                league,
                matches: lMatches
            });
        }
    });

    // Anotadores / Goleadores de la jornada
    const playerGoalsMap = {};
    playedMatches.forEach(m => {
        if (m.scorers && Array.isArray(m.scorers)) {
            m.scorers.forEach(s => {
                if (s.playerId && s.count > 0) {
                    playerGoalsMap[s.playerId] = (playerGoalsMap[s.playerId] || 0) + s.count;
                }
            });
        }
    });

    const sortedScorers = Object.keys(playerGoalsMap)
        .map(pId => {
            const pObj = (visPlayers || []).find(p => p.id === pId);
            const tObj = (visTeams || []).find(t => t.id === pObj?.teamId);
            return {
                id: pId,
                name: pObj?.name || 'Alumno',
                teamName: tObj?.name || 'Equipo',
                goals: playerGoalsMap[pId]
            };
        })
        .sort((a, b) => b.goals - a.goals);

    let topScorers = [];
    if (sortedScorers.length > 0) {
        const maxGoals = sortedScorers[0].goals;
        topScorers = sortedScorers.filter(s => s.goals === maxGoals || s.goals >= Math.max(1, maxGoals - 1));
    }

    // Próxima jornada pendiente
    const pendingMatches = visMatches.filter(m => m.scoreHome === null || m.scoreHome === undefined);
    const pendingDates = [...new Set(pendingMatches.map(m => m.date))].filter(Boolean).sort();
    const nextPendingDate = pendingDates.length > 0 ? pendingDates[0] : null;
    
    const upcomingMatches = nextPendingDate 
        ? pendingMatches.filter(m => m.date === nextPendingDate)
        : pendingMatches;

    return { targetDate, leagueResultsMap, topScorers, upcomingMatches };
};

// --- 2. Copiar Texto Formateado para Facebook ---
const copyFacebookSummaryText = (visMatches, visLeagues, visTeams, visPlayers, selectedDate, levelName = 'PRIMARIA') => {
    const { targetDate, leagueResultsMap, topScorers, upcomingMatches } = getFacebookSummaryData(visMatches, visLeagues, visTeams, visPlayers, selectedDate);
    const sportTitle = (currentSport || 'FÚTBOL').toUpperCase();
    const scoringInfo = getSportScoringInfo(currentSport);
    const unitLabel = (scoringInfo.unit || 'puntos').toLowerCase();
    const sportEmoji = scoringInfo.emoji || '🏆';

    let text = `🏆 LIGAS LA SALLE TUXTLA — ${levelName.toUpperCase()} 🏆\n` +
               `📌 RESUMEN DE LA JORNADA (${sportEmoji} ${sportTitle}${targetDate ? ` — ${targetDate}` : ''})\n\n` +
               `${sportEmoji} RESULTADOS DE LA SEMANA:\n`;

    if (leagueResultsMap.length === 0) {
        text += `(No hay resultados registrados en esta jornada aún)\n`;
    } else {
        leagueResultsMap.forEach(({ league, matches }) => {
            text += `\n🔹 ${league.name}:\n`;
            matches.forEach(m => {
                const home = getTeamName(m.homeTeamId);
                const away = getTeamName(m.awayTeamId);
                const status = m.status === 'Anulado' ? '(Anulado 0-0)' : '';
                text += `  • ${home} ${m.scoreHome} - ${m.scoreAway} ${away} ${status}\n`;
            });
        });
    }

    text += `\n🥇 ${scoringInfo.scorerTitle.toUpperCase()} DE LA JORNADA:\n`;
    if (topScorers.length === 0) {
        text += `  Sin anotadores registrados.\n`;
    } else {
        topScorers.forEach(s => {
            text += `  ⭐ ${s.name} (${s.teamName}) — ${s.goals} ${unitLabel}\n`;
        });
    }

    text += `\n📅 PRÓXIMA JORNADA:\n`;
    if (upcomingMatches.length === 0) {
        text += `  Sin partidos agendados.\n`;
    } else {
        upcomingMatches.forEach(m => {
            const home = getTeamName(m.homeTeamId);
            const away = getTeamName(m.awayTeamId);
            text += `  🗓️ ${m.date || 'Por definir'}: ${home} vs ${away}\n`;
        });
    }

    const tagLevel = levelName.toLowerCase().includes('prepa') ? '#Preparatoria' : '#Primaria';
    text += `\n#LigasLaSalle ${tagLevel} #OrgulloLaSalle #Tuxtla`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        showMessage("📋 Texto para Facebook copiado al portapapeles con éxito.");
    } else {
        prompt("Copia este texto para publicar en Facebook:", text);
    }
};

// --- 3. Abrir e Imprimir Póster de Facebook ---
const printFacebookSummaryWindow = (visMatches, visLeagues, visTeams, visPlayers, selectedDate, levelName = 'Primaria Tuxtla') => {
    const { targetDate, leagueResultsMap, topScorers, upcomingMatches } = getFacebookSummaryData(visMatches, visLeagues, visTeams, visPlayers, selectedDate);
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showMessage("Por favor permite las ventanas emergentes."); return; }

    const sportTitle = (currentSport || 'FÚTBOL').toUpperCase();
    const scoringInfo = getSportScoringInfo(currentSport);
    const unitLabel = (scoringInfo.unit || 'puntos').toLowerCase();
    const sportEmoji = scoringInfo.emoji || '🏆';

    // Degradados por deporte
    let bgGradient = 'linear-gradient(135deg, #101097 0%, #001E61 100%)';
    if (currentSport === 'Básquetbol') bgGradient = 'linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)';
    else if (currentSport === 'Tocho') bgGradient = 'linear-gradient(135deg, #be123c 0%, #881337 100%)';
    else if (currentSport === 'Voleibol') bgGradient = 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)';

    let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Resumen de la Jornada — Facebook</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #fff; padding: 30px; display: flex; flex-direction: column; align-items: center; }
                .actions-bar { width: 100%; max-width: 760px; margin-bottom: 20px; display: flex; justify-content: space-between; gap: 10px; }
                .btn-action { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
                .btn-print { background: #101097; color: white; }
                .btn-copy { background: #CE0E2D; color: white; }
                .poster-card { width: 100%; max-width: 760px; background: ${bgGradient}; border-radius: 28px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 4px solid #CE0E2D; position: relative; overflow: hidden; }
                .poster-header { text-align: center; border-bottom: 2px solid rgba(255, 255, 255, 0.15); padding-bottom: 18px; margin-bottom: 22px; }
                .header-logo-row { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px; }
                .school-logo { width: 54px; height: 54px; object-fit: contain; background: #fff; border-radius: 50%; padding: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
                .brand-title { font-size: 32px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #fff; line-height: 1; }
                .brand-title span { color: #60a5fa; }
                .section-badge { display: inline-block; background: #CE0E2D; color: white; font-weight: 800; font-size: 12px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
                .sport-label { font-size: 15px; color: #93c5fd; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
                .section-title { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #fbbf24; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.3); padding-bottom: 6px; }
                .results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 22px; }
                @media (max-width: 600px) { .results-grid { grid-template-columns: 1fr; } }
                .group-block { background: rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.12); }
                .group-name { font-size: 13px; font-weight: 800; color: #93c5fd; margin-bottom: 10px; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; }
                .match-row { display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.3); padding: 6px 10px; border-radius: 12px; margin-bottom: 6px; font-size: 12px; gap: 4px; }
                .team-wrap { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; overflow: hidden; }
                .match-team { font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #fff; flex: 1; min-width: 0; font-size: 11px; }
                .team-logo-icon { width: 24px; height: 24px; object-fit: contain; border-radius: 50%; background: #fff; padding: 1.5px; border: 1px solid rgba(255, 255, 255, 0.4); flex-shrink: 0; }
                .match-score { font-weight: 900; color: #fbbf24; font-size: 13px; background: rgba(255, 255, 255, 0.18); padding: 3px 8px; border-radius: 6px; flex-shrink: 0; white-space: nowrap; text-align: center; margin: 0 4px; }
                .bottom-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; }
                @media (max-width: 600px) { .bottom-grid { grid-template-columns: 1fr; } }
                .bottom-block { background: rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.12); }
                .scorer-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(0, 0, 0, 0.25); border-radius: 10px; margin-bottom: 6px; font-size: 12px; }
                .scorer-name { font-weight: 800; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; font-size: 11px; }
                .scorer-team { color: #94a3b8; font-size: 10px; margin-left: 4px; flex-shrink: 0; }
                .scorer-badge { background: #fbbf24; color: #0f172a; font-weight: 900; padding: 2px 8px; border-radius: 14px; font-size: 11px; flex-shrink: 0; margin-left: 6px; }
                .upcoming-card { background: rgba(0, 0, 0, 0.25); padding: 8px 10px; border-radius: 10px; margin-bottom: 6px; font-size: 11px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.05); }
                .upcoming-teams-wrap { display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 800; color: #fff; margin-bottom: 2px; }
                .upcoming-date { color: #94a3b8; font-size: 10px; }
                .poster-footer { text-align: center; font-size: 11px; color: rgba(255, 255, 255, 0.5); border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 10px; margin-top: 10px; }
                @media print { body { background: #fff; padding: 0; } .actions-bar { display: none; } .poster-card { max-width: 100%; box-shadow: none; } }
            </style>
        </head>
        <body>
            <div class="actions-bar">
                <button onclick="window.print()" class="btn-action btn-print">🖨️ Imprimir / Guardar Imagen</button>
                <button onclick="if(window.opener && window.opener.copyFacebookSummaryText) { window.opener.copyFacebookSummaryText(window.opener.visibleMatches, window.opener.visibleLeagues, window.opener.visibleTeams, window.opener.visiblePlayers, null, '${levelName}'); } else { alert('Copiado'); }" class="btn-action btn-copy">📋 Copiar Texto para Facebook</button>
            </div>

            <div class="poster-card">
                <div class="poster-header">
                    <div class="header-logo-row">
                        <img src="https://i.imgur.com/pbiHVPL.png" class="school-logo" alt="La Salle Logo" />
                        <div class="brand-title">Ligas <span>La Salle</span></div>
                    </div>
                    <div class="section-badge">${levelName}</div>
                    <div class="sport-label">${sportEmoji} Resumen de la Jornada — ${sportTitle} ${targetDate ? `(${targetDate})` : ''}</div>
                </div>

                <div class="section-title">${sportEmoji} Resultados de la Semana</div>
                <div class="results-grid">
                    ${leagueResultsMap.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 15px;">No hay resultados registrados en esta jornada.</div>' : 
                        leagueResultsMap.map(({ league, matches }) => `
                            <div class="group-block">
                                <div class="group-name">${league.name}</div>
                                ${matches.map(m => {
                                    const hTeam = (visTeams || []).find(t => t.id === m.homeTeamId);
                                    const aTeam = (visTeams || []).find(t => t.id === m.awayTeamId);
                                    return `
                                        <div class="match-row">
                                            <div class="team-wrap">
                                                <img src="${hTeam?.logoUrl || 'https://crests.football-data.org/86.png'}" class="team-logo-icon" />
                                                <span class="match-team">${hTeam?.name || 'Local'}</span>
                                            </div>
                                            <div class="match-score">${m.scoreHome} - ${m.scoreAway}</div>
                                            <div class="team-wrap right">
                                                <span class="match-team right">${aTeam?.name || 'Visitante'}</span>
                                                <img src="${aTeam?.logoUrl || 'https://crests.football-data.org/81.png'}" class="team-logo-icon" />
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `).join('')
                    }
                </div>

                <div class="bottom-grid">
                    <div class="bottom-block">
                        <div class="section-title">🥇 ${scoringInfo.scorerTitle.toUpperCase()} DE LA FECHA</div>
                        ${topScorers.length === 0 ? '<div style="color:#94a3b8; font-size:11px;">Sin anotadores registrados</div>' :
                            topScorers.map(s => `
                                <div class="scorer-item">
                                    <span class="scorer-name">⭐ ${s.name} <span class="scorer-team">(${s.teamName})</span></span>
                                    <span class="scorer-badge">${s.goals} ${unitLabel}</span>
                                </div>
                            `).join('')
                        }
                    </div>

                    <div class="bottom-block">
                        <div class="section-title">📅 PRÓXIMOS PARTIDOS</div>
                        ${upcomingMatches.length === 0 ? '<div style="color:#94a3b8; font-size:11px;">Sin partidos agendados</div>' :
                            upcomingMatches.map(m => {
                                const hTeam = (visTeams || []).find(t => t.id === m.homeTeamId);
                                const aTeam = (visTeams || []).find(t => t.id === m.awayTeamId);
                                return `
                                    <div class="upcoming-card">
                                        <div class="upcoming-teams-wrap">
                                            <span>${hTeam?.name || 'Local'}</span> vs <span>${aTeam?.name || 'Visitante'}</span>
                                        </div>
                                        <div class="upcoming-date">🗓️ ${m.date || 'Por definir'}</div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>

                <div class="poster-footer">
                    Colegio La Salle Tuxtla — Coordinación de Deportes
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
```

---

## 🎨 Paso 2: Agregar los Botones en la Interfaz (React JSX)

Busca el contenedor donde desees colocar la sección de redes sociales (por ejemplo, en el panel administrativo o debajo del filtro de fecha/jornada) e inserta el siguiente bloque:

```jsx
{/* Seccion Resumen de la Jornada para Redes Sociales */}
<div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
    <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold font-outfit text-slate-900 dark:text-white flex items-center">
            📱 Resumen de la Jornada para Redes Sociales (Facebook / Instagram)
        </h4>
    </div>
    <div className="flex flex-wrap gap-4">
        {/* Boton 1: Generar Poster Visual */}
        <button 
            onClick={() => printFacebookSummaryWindow(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, upcomingMatchesDate, 'Primaria Tuxtla')} 
            className="btn-primary flex-1 min-w-[220px] flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold"
        >
            🖼️ Generar Póster Visual (Imprimir / Exportar)
        </button>

        {/* Boton 2: Copiar Texto Formateado */}
        <button 
            onClick={() => copyFacebookSummaryText(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, upcomingMatchesDate, 'PRIMARIA')} 
            className="btn-secondary flex-1 min-w-[220px] flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all"
        >
            📋 Copiar Texto Formateado para Facebook
        </button>
    </div>
</div>
```

> **Nota:** Ajusta el parámetro `'Primaria Tuxtla'` o `'Preparatoria Tuxtla'` según la app donde lo estés instalando.

---

## 📌 Adaptación para Primaria vs. Preparatoria

- **Para Primaria:**
  - Cambiar la etiqueta de nivel a `'Primaria Tuxtla'` / `'PRIMARIA'`.
  - Hashtags generados: `#LigasLaSalle #Primaria #OrgulloLaSalle #Tuxtla`

- **Para Preparatoria:**
  - Cambiar la etiqueta de nivel a `'Preparatoria Tuxtla'` / `'PREPARATORIA'`.
  - Hashtags generados: `#LigasLaSalle #Preparatoria #OrgulloLaSalle #Tuxtla`
