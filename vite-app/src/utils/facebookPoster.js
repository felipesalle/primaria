import { getSportScoringInfo, sortLeagues } from '../config/constants';

export const getFacebookSummaryData = (visMatches, visLeagues, visTeams, visPlayers, selectedDate, sportFilter = 'ALL') => {
    const targetLeagues = sportFilter && sportFilter !== 'ALL' 
        ? visLeagues.filter(l => l.sport === sportFilter)
        : visLeagues;
    const targetLeagueIds = targetLeagues.map(l => l.id);
    const targetMatches = visMatches.filter(m => targetLeagueIds.includes(m.leagueId));

    const sortedLeagues = [...targetLeagues].sort(sortLeagues);
    const allPlayedMatches = targetMatches.filter(m => m.scoreHome !== null && m.scoreHome !== undefined);
    const playedDates = [...new Set(allPlayedMatches.map(m => m.date))].filter(Boolean).sort();
    const targetDate = selectedDate || (playedDates.length > 0 ? playedDates[playedDates.length - 1] : null);

    const playedMatches = targetDate 
        ? allPlayedMatches.filter(m => m.date === targetDate)
        : allPlayedMatches;

    const leagueResultsMap = [];
    sortedLeagues.forEach(league => {
        const lMatches = playedMatches.filter(m => m.leagueId === league.id);
        if (lMatches.length > 0) {
            leagueResultsMap.push({ league, matches: lMatches });
        }
    });

    const scorersBySport = {};
    playedMatches.forEach(m => {
        const mLeague = visLeagues.find(l => l.id === m.leagueId);
        const sport = mLeague?.sport || 'Fútbol';
        if (!scorersBySport[sport]) scorersBySport[sport] = {};

        if (m.scorers && Array.isArray(m.scorers)) {
            m.scorers.forEach(s => {
                if (s.playerId && s.count > 0) {
                    scorersBySport[sport][s.playerId] = (scorersBySport[sport][s.playerId] || 0) + s.count;
                }
            });
        }
    });

    const topScorersBySport = {};
    Object.keys(scorersBySport).forEach(sport => {
        const playerMap = scorersBySport[sport];
        const sorted = Object.keys(playerMap)
            .map(pId => {
                const pObj = (visPlayers || []).find(p => p.id === pId);
                const tObj = (visTeams || []).find(t => t.id === pObj?.teamId);
                return {
                    id: pId,
                    name: pObj?.name || 'Alumno',
                    group: pObj?.group || '',
                    teamName: tObj?.name || 'Equipo',
                    goals: playerMap[pId]
                };
            })
            .sort((a, b) => b.goals - a.goals);

        if (sorted.length > 0) {
            const maxGoals = sorted[0].goals;
            topScorersBySport[sport] = sorted.filter(s => s.goals === maxGoals || s.goals >= Math.max(1, maxGoals - 1));
        } else {
            topScorersBySport[sport] = [];
        }
    });

    const pendingMatches = targetMatches.filter(m => m.scoreHome === null || m.scoreHome === undefined);
    const pendingDates = [...new Set(pendingMatches.map(m => m.date))].filter(Boolean).sort();
    const nextPendingDate = pendingDates.length > 0 ? pendingDates[0] : null;
    
    const upcomingMatches = nextPendingDate 
        ? pendingMatches.filter(m => m.date === nextPendingDate)
        : pendingMatches;

    return { targetDate, leagueResultsMap, topScorersBySport, upcomingMatches, playedMatches };
};

export const copyFacebookSummaryText = (visMatches, visLeagues, visTeams, visPlayers, selectedDate, getTeamName, showMessage, levelName = 'PRIMARIA') => {
    const { targetDate, leagueResultsMap, topScorersBySport, upcomingMatches } = getFacebookSummaryData(visMatches, visLeagues, visTeams, visPlayers, selectedDate, 'ALL');

    let text = `🏆 LIGAS LA SALLE TUXTLA — ${levelName.toUpperCase()} 🏆\n` +
               `📌 RESUMEN DE LA JORNADA${targetDate ? ` (${targetDate})` : ''}\n\n`;

    const sportsInResults = [...new Set(leagueResultsMap.map(item => item.league.sport))];

    if (leagueResultsMap.length === 0) {
        text += `(No hay resultados registrados en esta jornada aún)\n\n`;
    } else {
        sportsInResults.forEach(sport => {
            const info = getSportScoringInfo(sport);
            text += `${info.emoji} RESULTADOS DE ${sport.toUpperCase()}:\n`;
            const sportLeagues = leagueResultsMap.filter(item => item.league.sport === sport);
            sportLeagues.forEach(({ league, matches }) => {
                text += `\n🔹 ${league.name}:\n`;
                matches.forEach(m => {
                    const home = getTeamName(m.homeTeamId);
                    const away = getTeamName(m.awayTeamId);
                    const status = m.status === 'Anulado' ? '(Anulado 0-0)' : '';
                    text += `  • ${home} ${m.scoreHome} - ${m.scoreAway} ${away} ${status}\n`;
                });
            });
            text += `\n`;
        });
    }

    Object.keys(topScorersBySport).forEach(sport => {
        const info = getSportScoringInfo(sport);
        const list = topScorersBySport[sport];
        text += `🥇 ${info.scorerTitle.toUpperCase()} DE ${sport.toUpperCase()}:\n`;
        if (!list || list.length === 0) {
            text += `  Sin anotadores registrados.\n\n`;
        } else {
            list.forEach(s => {
                const grp = s.group ? ` (${s.group})` : '';
                text += `  ⭐ ${s.name}${grp} [${s.teamName}] — ${s.goals} ${info.unit}\n`;
            });
            text += `\n`;
        }
    });

    text += `📅 PRÓXIMA JORNADA:\n`;
    if (upcomingMatches.length === 0) {
        text += `  Sin partidos agendados.\n`;
    } else {
        upcomingMatches.forEach(m => {
            const home = getTeamName(m.homeTeamId);
            const away = getTeamName(m.awayTeamId);
            const mLeague = visLeagues.find(l => l.id === m.leagueId);
            const sportEmoji = getSportScoringInfo(mLeague?.sport).emoji || '⚽';
            text += `  🗓️ ${m.date || 'Por definir'} ${sportEmoji} (${mLeague?.name || ''}): ${home} vs ${away}\n`;
        });
    }

    text += `\n#LigasLaSalle #Primaria #OrgulloLaSalle #Tuxtla #Fútbol #Básquetbol`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        if (showMessage) showMessage("📋 Resumen multi-deporte de Primaria copiado al portapapeles con éxito.");
    } else {
        prompt("Copia este texto para publicar en Facebook:", text);
    }
};

export const printFacebookSummaryWindow = (visMatches, visLeagues, visTeams, visPlayers, selectedDate, sportFilter = 'ALL', levelName = 'Primaria Tuxtla', showMessage) => {
    const { targetDate, leagueResultsMap, topScorersBySport, upcomingMatches } = getFacebookSummaryData(visMatches, visLeagues, visTeams, visPlayers, selectedDate, sportFilter);
    const printWindow = window.open('', '_blank');
    if (!printWindow) { if (showMessage) showMessage("Por favor permite las ventanas emergentes."); return; }

    const isCombined = sportFilter === 'ALL';
    const mainTitle = isCombined ? 'Resumen Multi-Deporte' : `Resumen de ${sportFilter}`;

    let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Resumen de la Jornada — Facebook (${levelName})</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #fff; padding: 30px; display: flex; flex-direction: column; align-items: center; }
                .actions-bar { width: 100%; max-width: 820px; margin-bottom: 20px; display: flex; justify-content: space-between; gap: 10px; }
                .btn-action { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
                .btn-print { background: #101097; color: white; }
                .btn-copy { background: #CE0E2D; color: white; }
                .poster-card { width: 100%; max-width: 820px; background: linear-gradient(135deg, #101097 0%, #001E61 100%); border-radius: 28px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 4px solid #CE0E2D; position: relative; overflow: hidden; }
                .poster-header { text-align: center; border-bottom: 2px solid rgba(255, 255, 255, 0.15); padding-bottom: 18px; margin-bottom: 22px; }
                .header-logo-row { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px; }
                .school-logo { width: 56px; height: 56px; object-fit: contain; background: #fff; border-radius: 50%; padding: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
                .brand-title { font-size: 34px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #fff; line-height: 1; }
                .brand-title span { color: #60a5fa; }
                .section-badge { display: inline-block; background: #CE0E2D; color: white; font-weight: 800; font-size: 12px; padding: 4px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
                .sport-label { font-size: 16px; color: #93c5fd; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
                .section-title { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #fbbf24; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.3); padding-bottom: 6px; }
                .sport-banner { padding: 8px 14px; border-radius: 12px; font-weight: 800; text-transform: uppercase; font-size: 13px; margin-bottom: 12px; display: flex; items-center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); }
                .sport-banner-futbol { background: linear-gradient(90deg, #059669 0%, #064e3b 100%); color: #fff; }
                .sport-banner-basquet { background: linear-gradient(90deg, #ea580c 0%, #9a3412 100%); color: #fff; }
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
            </div>

            <div class="poster-card">
                <div class="poster-header">
                    <div class="header-logo-row">
                        <img src="https://i.imgur.com/pbiHVPL.png" class="school-logo" alt="La Salle Logo" />
                        <div class="brand-title">Ligas <span>La Salle</span></div>
                    </div>
                    <div class="section-badge">${levelName}</div>
                    <div class="sport-label">🏆 ${mainTitle} ${targetDate ? `— Jornada (${targetDate})` : ''}</div>
                </div>

                <div class="section-title">📊 Marcadores y Resultados de la Jornada</div>
                <div class="results-grid">
                    ${leagueResultsMap.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 15px;">No hay resultados registrados en esta jornada.</div>' : 
                        leagueResultsMap.map(({ league, matches }) => {
                            const isFut = league.sport === 'Fútbol';
                            const bannerClass = isFut ? 'sport-banner-futbol' : 'sport-banner-basquet';
                            const sportEmoji = isFut ? '⚽' : '🏀';
                            return `
                                <div class="group-block">
                                    <div class="sport-banner ${bannerClass}">${sportEmoji} ${league.sport} — ${league.name}</div>
                                    ${matches.map(m => {
                                        const hTeam = (visTeams || []).find(t => t.id === m.homeTeamId);
                                        const aTeam = (visTeams || []).find(t => t.id === m.awayTeamId);
                                        return `
                                            <div class="match-row">
                                                <div class="team-wrap">
                                                    <img src="${hTeam?.logoUrl || 'https://crests.football-data.org/86.png'}" class="team-logo-icon" onError="this.src='https://ui-avatars.com/api/?name=EQ&background=101097&color=fff'" />
                                                    <span class="match-team">${hTeam?.name || 'Local'}</span>
                                                </div>
                                                <div class="match-score">${m.scoreHome} - ${m.scoreAway}</div>
                                                <div class="team-wrap right">
                                                    <span class="match-team right">${aTeam?.name || 'Visitante'}</span>
                                                    <img src="${aTeam?.logoUrl || 'https://crests.football-data.org/81.png'}" class="team-logo-icon" onError="this.src='https://ui-avatars.com/api/?name=EQ&background=101097&color=fff'" />
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `;
                        }).join('')
                    }
                </div>

                <div class="bottom-grid">
                    <div class="bottom-block">
                        <div class="section-title">🥇 MÁXIMOS ANOTADORES DE LA FECHA</div>
                        ${Object.keys(topScorersBySport).length === 0 ? '<div style="color:#94a3b8; font-size:11px;">Sin anotadores registrados</div>' :
                            Object.keys(topScorersBySport).map(sport => {
                                const info = getSportScoringInfo(sport);
                                const list = topScorersBySport[sport];
                                if (!list || list.length === 0) return '';
                                return `
                                    <div style="margin-bottom:8px;">
                                        <div style="font-size:11px; font-weight:800; color:#fbbf24; margin-bottom:4px;">${info.emoji} ${sport}:</div>
                                        ${list.map(s => `
                                            <div class="scorer-item">
                                                <span class="scorer-name">⭐ ${s.name} ${s.group ? `(${s.group})` : ''} <span class="scorer-team">[${s.teamName}]</span></span>
                                                <span class="scorer-badge">${s.goals} ${info.unit}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>

                    <div class="bottom-block">
                        <div class="section-title">📅 PRÓXIMOS PARTIDOS</div>
                        ${upcomingMatches.length === 0 ? '<div style="color:#94a3b8; font-size:11px;">Sin partidos agendados</div>' :
                            upcomingMatches.map(m => {
                                const hTeam = (visTeams || []).find(t => t.id === m.homeTeamId);
                                const aTeam = (visTeams || []).find(t => t.id === m.awayTeamId);
                                const mLeague = (visLeagues || []).find(l => l.id === m.leagueId);
                                const isFut = mLeague?.sport === 'Fútbol';
                                const sportEmoji = isFut ? '⚽' : '🏀';
                                return `
                                    <div class="upcoming-card">
                                        <div class="upcoming-teams-wrap">
                                            <span>${hTeam?.name || 'Local'}</span> vs <span>${aTeam?.name || 'Visitante'}</span>
                                        </div>
                                        <div class="upcoming-date">${sportEmoji} ${mLeague?.name || ''} — 🗓️ ${m.date || 'Por definir'}</div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>

                <div class="poster-footer">
                    Colegio La Salle Tuxtla — Coordinación de Deportes Primaria
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
