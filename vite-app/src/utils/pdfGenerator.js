import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sortLeagues } from '../config/constants';

export const svgToPngDataUrl = (svgUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth || img.width || 100;
                canvas.height = img.naturalHeight || img.height || 100;
                ctx.drawImage(img, 0, 0);
                const pngDataUrl = canvas.toDataURL('image/png');
                resolve({ dataUrl: pngDataUrl, format: 'PNG' });
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = svgUrl;
    });
};

export const urlToB64 = (url) => {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth || img.width || 100;
                canvas.height = img.naturalHeight || img.height || 100;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                resolve({ dataUrl, format: 'PNG' });
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

export const generateUpcomingMatchesPdf = async ({ visibleMatches, upcomingMatchesDate, tournaments, selectedTournamentId, leagues, getTeamLogo, getTeamName, getLeagueName, showMessage }) => {
    if (!upcomingMatchesDate) {
        showMessage("Selecciona una fecha para generar el reporte de próximos partidos.");
        return;
    }

    const doc = new jsPDF();
    const activeTournamentObj = tournaments.find(t => t.id === selectedTournamentId);
    const pageCenter = doc.internal.pageSize.getWidth() / 2;

    const schoolLogoUrl = 'https://i.imgur.com/dzDfAiQ.png';
    const schoolLogoResult = await urlToB64(schoolLogoUrl);

    let y = 15;

    if (schoolLogoResult) {
        doc.addImage(schoolLogoResult.dataUrl, schoolLogoResult.format.toUpperCase(), 15, 10, 20, 20);
    }

    doc.setFontSize(16).setFont(undefined, 'bold').setTextColor(0, 30, 97);
    doc.text("LIGAS LA SALLE PRIMARIA TUXTLA", pageCenter, y, { align: 'center' });
    y += 7;
    doc.setFontSize(12).setFont(undefined, 'normal').setTextColor(100);
    doc.text(`Próximos Partidos - Fecha: ${upcomingMatchesDate}`, pageCenter, y, { align: 'center' });
    y += 5;
    if (activeTournamentObj?.name) {
        doc.setFontSize(10).setFont(undefined, 'italic').setTextColor(150);
        doc.text(activeTournamentObj.name, pageCenter, y, { align: 'center' });
        y += 5;
    }

    y += 5;
    doc.setLineWidth(0.5).setDrawColor(0, 30, 97).line(15, y, 195, y);
    y += 10;

    const matchesForDate = visibleMatches
        .filter(m => m.date === upcomingMatchesDate)
        .sort((a, b) => {
            const leagueA = leagues.find(l => l.id === a.leagueId);
            const leagueB = leagues.find(l => l.id === b.leagueId);
            if (!leagueA || !leagueB) return 0;
            return sortLeagues(leagueA, leagueB);
        });

    if (matchesForDate.length === 0) {
        showMessage("No hay partidos programados para la fecha seleccionada.");
        return;
    }

    const matchesByLeague = matchesForDate.reduce((acc, match) => {
        acc[match.leagueId] = acc[match.leagueId] || [];
        acc[match.leagueId].push(match);
        return acc;
    }, {});

    const leagueIds = Object.keys(matchesByLeague).sort((aId, bId) => {
        const leagueA = leagues.find(l => l.id === aId);
        const leagueB = leagues.find(l => l.id === bId);
        if (!leagueA || !leagueB) return 0;
        return sortLeagues(leagueA, leagueB);
    });

    for (const leagueId of leagueIds) {
        const league = leagues.find(l => l.id === leagueId);
        const leagueMatches = matchesByLeague[leagueId];

        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(13).setFont(undefined, 'bold').setTextColor(0, 30, 97);
        doc.text(`⚽ ${getLeagueName(leagueId)}`, 15, y);
        if (league?.matchTime) {
            doc.setFontSize(10).setFont(undefined, 'normal').setTextColor(100);
            doc.text(`Horario habitual: ${league.matchTime}`, 195, y, { align: 'right' });
        }
        y += 6;

        for (const match of leagueMatches) {
            if (y > 265) {
                doc.addPage();
                y = 20;
            }

            const [homeLogoResult, awayLogoResult] = await Promise.all([
                urlToB64(getTeamLogo(match.homeTeamId)),
                urlToB64(getTeamLogo(match.awayTeamId))
            ]);

            doc.setFillColor(245, 247, 250);
            doc.roundedRect(15, y, 180, 16, 2, 2, 'F');
            doc.setLineWidth(0.1).setDrawColor(220);
            doc.roundedRect(15, y, 180, 16, 2, 2, 'D');

            let currentX = 20;

            if (homeLogoResult) {
                doc.addImage(homeLogoResult.dataUrl, homeLogoResult.format.toUpperCase(), currentX, y + 3, 10, 10);
            }
            currentX += 13;

            doc.setFontSize(10).setFont(undefined, 'bold').setTextColor(40);
            doc.text(getTeamName(match.homeTeamId), currentX, y + 10);

            doc.setFontSize(11).setFont(undefined, 'bold').setTextColor(206, 14, 45);
            doc.text("VS", pageCenter, y + 10, { align: 'center' });

            let rightX = 185;
            if (awayLogoResult) {
                doc.addImage(awayLogoResult.dataUrl, awayLogoResult.format.toUpperCase(), rightX - 10, y + 3, 10, 10);
            }
            rightX -= 13;

            doc.setFontSize(10).setFont(undefined, 'bold').setTextColor(40);
            doc.text(getTeamName(match.awayTeamId), rightX, y + 10, { align: 'right' });

            y += 20;
        }
        y += 5;
    }

    doc.save(`proximos_partidos_${upcomingMatchesDate}.pdf`);
    showMessage("PDF de Próximos Partidos generado con éxito.");
};

export const generateRefereeSheetPdf = async ({ visibleMatches, visiblePlayers, refereeMatchDate, leagues, getLeagueName, getTeamName, getTeamLogo, getPlayersByTeam, showMessage }) => {
    if (!refereeMatchDate) {
        showMessage("Selecciona una fecha para la cédula.");
        return;
    }
    const doc = new jsPDF();
    const pageCenter = doc.internal.pageSize.getWidth() / 2;

    const filteredMatches = visibleMatches
        .filter(match => match.date === refereeMatchDate)
        .sort((a, b) => {
            const leagueA = leagues.find(l => l.id === a.leagueId);
            const leagueB = leagues.find(l => l.id === b.leagueId);
            if (!leagueA || !leagueB) return 0;
            return sortLeagues(leagueA, leagueB);
        });

    if (filteredMatches.length === 0) {
        showMessage("No hay partidos para la fecha seleccionada.");
        return;
    }

    let matchCount = 0;
    for (const match of filteredMatches) {
        const isFirstOnPage = matchCount % 2 === 0;
        if (matchCount > 0 && isFirstOnPage) doc.addPage();

        const yOffset = isFirstOnPage ? 15 : 150;
        let y = yOffset;

        const [homeLogoResult, awayLogoResult] = await Promise.all([
            urlToB64(getTeamLogo(match.homeTeamId)),
            urlToB64(getTeamLogo(match.awayTeamId))
        ]);

        doc.setFontSize(16).text("Cédula de Partido", pageCenter, y, { align: 'center' });
        y += 8;
        doc.setFontSize(10).text(`Liga: ${getLeagueName(match.leagueId)}`, 15, y);
        doc.text(`Fecha: ${match.date}`, 195, y, { align: 'right' });
        y += 5;
        
        doc.setLineWidth(0.5).line(15, y, 195, y);
        y += 8;

        if (homeLogoResult) {
            doc.addImage(homeLogoResult.dataUrl, homeLogoResult.format.toUpperCase(), 45, y, 12, 12);
        }
        doc.setFontSize(11).text(getTeamName(match.homeTeamId), 60, y + 8);

        doc.setFontSize(11).text("VS", pageCenter, y + 8, { align: 'center' });

        if (awayLogoResult) {
            doc.addImage(awayLogoResult.dataUrl, awayLogoResult.format.toUpperCase(), 153, y, 12, 12);
        }
        doc.setFontSize(11).text(getTeamName(match.awayTeamId), 148, y + 8, { align: 'right' });
        
        y += 20;

        const homeTeamPlayers = getPlayersByTeam(match.homeTeamId).filter(p => visiblePlayers.some(vp => vp.id === p.id)).map(p => [p.name, '']);
        const awayTeamPlayers = getPlayersByTeam(match.awayTeamId).filter(p => visiblePlayers.some(vp => vp.id === p.id)).map(p => [p.name, '']);

        autoTable(doc, { startY: y, head: [['Jugadores Local', 'N']], body: homeTeamPlayers.length > 0 ? homeTeamPlayers : [['No hay jugadores', '']], theme: 'grid', margin: { left: 15, right: 110 }, styles: { fontSize: 8, cellPadding: 1 }, headStyles: { fillColor: [22, 160, 133], fontSize: 9 }, columnStyles: { 1: { cellWidth: 10 } } });
        autoTable(doc, { startY: y, head: [['Jugadores Visitante', 'N']], body: awayTeamPlayers.length > 0 ? awayTeamPlayers : [['No hay jugadores', '']], theme: 'grid', margin: { left: 110, right: 15 }, styles: { fontSize: 8, cellPadding: 1 }, headStyles: { fillColor: [22, 160, 133], fontSize: 9 }, columnStyles: { 1: { cellWidth: 10 } } });

        y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40) + 7;

        doc.setFontSize(9).text("Marcador Final:", 15, y);
        doc.rect(45, y - 3, 20, 7);
        doc.text("Observaciones:", 75, y);
        doc.rect(100, y - 3, 95, 12);
        y += 15;
        
        doc.line(20, y, 80, y); doc.setFontSize(9).text("Firma Árbitro", 40, y + 4);
        doc.line(120, y, 180, y); doc.setFontSize(9).text("Firma Capitán", 140, y + 4);
        
        matchCount++;
    }

    doc.save(`cedula_arbitro_${refereeMatchDate}.pdf`);
    showMessage("Cédula de Árbitro generada.");
};

export const generateStandingsAndTopScorersPdf = async ({ visibleLeagues, visibleTeams, visibleMatches, visiblePlayers, tournaments, selectedTournamentId, calculateStandings, calculateTopScorers, showMessage }) => {
    const doc = new jsPDF();
    const tournamentTitle = `Reporte de Torneo: ${tournaments.find(t => t.id === selectedTournamentId)?.name || ''}`;

    const logoUrls = [...new Set(visibleTeams.map(t => t.logoUrl))];
    const logoPromises = logoUrls.map(url => urlToB64(url));
    const logoResults = await Promise.all(logoPromises);
    const logoMap = logoUrls.reduce((map, url, index) => {
        map[url] = logoResults[index];
        return map;
    }, {});

    let isFirstLeague = true;
    for (const league of visibleLeagues.sort(sortLeagues)) {
        if (!isFirstLeague) {
            doc.addPage();
        }
        isFirstLeague = false;

        let y = 10;
        doc.setFontSize(18).text(tournamentTitle, 10, y);
        y += 15;

        doc.setFontSize(16).text(`Liga: ${league.name}`, 14, y);
        y += 10;

        doc.setFontSize(14).text("Clasificación:", 14, y);
        y += 7;
        const standings = calculateStandings(league.id, visibleTeams, visibleMatches);
        if (standings.length > 0) {
            autoTable(doc, {
                startY: y,
                head: [['', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts']],
                body: standings.map(t => ['', t.teamName, t.played, t.wins, t.draws, t.losses, t.goalsFor, t.goalsAgainst, t.goalDifference, t.points]),
                theme: 'grid',
                columnStyles: { 0: { cellWidth: 12 } },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 0) {
                        const team = standings[data.row.index];
                        const logoResult = logoMap[team.logoUrl];
                        if (logoResult) {
                            doc.addImage(logoResult.dataUrl, logoResult.format.toUpperCase(), data.cell.x + 2, data.cell.y + 2, 8, 8);
                        }
                    }
                }
            });
            y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40) + 10;
        } else { doc.text("No hay datos.", 14, y); y += 10; }

        if (y > 250) { doc.addPage(); y = 15; }
        doc.setFontSize(14).text("Tabla de Anotadores:", 14, y);
        y += 7;
        const scorers = calculateTopScorers(league.id, visibleMatches, visiblePlayers, visibleTeams);
        if (scorers.length > 0) {
            autoTable(doc, {
                startY: y,
                head: [['', 'Jugador', 'Equipo', 'Goles']],
                body: scorers.map(s => ['', s.playerName, s.teamName, s.goals]),
                theme: 'grid',
                columnStyles: { 0: { cellWidth: 12 } },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 0) {
                        const scorer = scorers[data.row.index];
                        const logoResult = logoMap[scorer.logoUrl];
                        if (logoResult) {
                            doc.addImage(logoResult.dataUrl, logoResult.format.toUpperCase(), data.cell.x + 2, data.cell.y + 2, 8, 8);
                        }
                    }
                }
            });
            y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40) + 10;
        } else { doc.text("No hay datos.", 14, y); y += 10; }
    }
    doc.save(`reporte_torneo_${selectedTournamentId}.pdf`);
    showMessage("PDF de Reporte de Torneo generado.");
};

export const generateTeamRostersPdf = async ({ selectedSport, visibleLeagues, visibleTeams, visiblePlayers, showMessage }) => {
    if (!selectedSport) {
        showMessage("Por favor, selecciona un deporte para generar la lista.");
        return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageCenter = doc.internal.pageSize.getWidth() / 2;

    const laSalleBlue = '#001E61';
    const laSalleRed = '#CE0E2D';
    const lightBlue = '#B3CDE0';

    const schoolLogoUrl = 'https://i.imgur.com/dzDfAiQ.png';
    const schoolLogoResult = await urlToB64(schoolLogoUrl);

    const sportLeagues = visibleLeagues
        .filter(l => l.sport === selectedSport)
        .sort(sortLeagues);

    if (sportLeagues.length === 0) {
        doc.setFontSize(12).text("No hay ligas para el deporte seleccionado.", 14, 15);
        doc.save(`listas_equipos_${selectedSport}.pdf`);
        return;
    }

    let isFirstPage = true;

    for (const league of sportLeagues) {
        if (!isFirstPage) {
            doc.addPage();
        }
        isFirstPage = false;

        let y = 25;

        if (schoolLogoResult) {
            doc.addImage(schoolLogoResult.dataUrl, schoolLogoResult.format.toUpperCase(), 15, 15, 20, 20);
        }

        doc.setFontSize(20).setFont(undefined, 'bold');
        doc.setTextColor(laSalleBlue);
        doc.text(league.name.toUpperCase(), pageCenter, y, { align: 'center' });
        y += 15;

        const leagueTeams = visibleTeams.filter(t => t.leagueId === league.id);
        if (leagueTeams.length === 0) continue;

        const teamLogoPromises = leagueTeams.map(team => urlToB64(team.logoUrl));
        const teamLogoResults = await Promise.all(teamLogoPromises);
        const logoMap = leagueTeams.reduce((map, team, index) => {
            map[team.id] = teamLogoResults[index];
            return map;
        }, {});

        for (let i = 0; i < leagueTeams.length; i += 2) {
            const team1 = leagueTeams[i];
            const team2 = leagueTeams[i + 1];

            if (y > 220) {
                doc.addPage();
                y = 25;
                if (schoolLogoResult) {
                    doc.addImage(schoolLogoResult.dataUrl, schoolLogoResult.format.toUpperCase(), 15, 15, 20, 20);
                }
            }

            let finalY1 = y;
            let finalY2 = y;

            if (team1) {
                const teamPlayers = visiblePlayers.filter(p => p.teamId === team1.id).map(p => [p.name, p.group || '-']);
                const teamLogoResult = logoMap[team1.id];
                
                doc.setFontSize(14).setFont(undefined, 'bold').setTextColor(laSalleRed);
                const teamNameX = teamLogoResult ? 28 : 14;
                if (teamLogoResult) {
                    doc.addImage(teamLogoResult.dataUrl, teamLogoResult.format.toUpperCase(), 14, y - 5, 10, 10);
                }
                doc.text(team1.name, teamNameX, y);

                autoTable(doc, {
                    startY: y + 8,
                    head: [['Nombre del Jugador', 'Grupo']],
                    body: teamPlayers.length > 0 ? teamPlayers : [['No hay jugadores registrados', '']],
                    theme: 'grid',
                    headStyles: { fillColor: lightBlue, textColor: laSalleBlue, fontStyle: 'bold' },
                    styles: { fontSize: 9, cellPadding: 1.5, lineColor: laSalleBlue, lineWidth: 0.1 },
                    margin: { left: 14, right: pageCenter + 5 },
                });
                finalY1 = doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40;
            }

            if (team2) {
                const teamPlayers = visiblePlayers.filter(p => p.teamId === team2.id).map(p => [p.name, p.group || '-']);
                const teamLogoResult = logoMap[team2.id];

                doc.setFontSize(14).setFont(undefined, 'bold').setTextColor(laSalleRed);
                const teamNameX = teamLogoResult ? pageCenter + 19 : pageCenter + 10;
                if (teamLogoResult) {
                    doc.addImage(teamLogoResult.dataUrl, teamLogoResult.format.toUpperCase(), pageCenter + 10, y - 5, 10, 10);
                }
                doc.text(team2.name, teamNameX, y);

                autoTable(doc, {
                    startY: y + 8,
                    head: [['Nombre del Jugador', 'Grupo']],
                    body: teamPlayers.length > 0 ? teamPlayers : [['No hay jugadores registrados', '']],
                    theme: 'grid',
                    headStyles: { fillColor: lightBlue, textColor: laSalleBlue, fontStyle: 'bold' },
                    styles: { fontSize: 9, cellPadding: 1.5, lineColor: laSalleBlue, lineWidth: 0.1 },
                    margin: { left: pageCenter + 10, right: 14 },
                });
                finalY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40;
            }
            
            y = Math.max(finalY1, finalY2) + 12;
        }
    }

    doc.save(`listas_equipos_${selectedSport}.pdf`);
    showMessage("PDF de Listas de Equipos generado.");
};
