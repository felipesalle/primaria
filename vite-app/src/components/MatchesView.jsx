import React, { useState } from 'react';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getSportTerms, sendTelegramNotification } from '../config/constants';
import { TrashIcon, PencilIcon } from './Icons';

export const MatchesView = ({ 
    matches, getTeamName, appId, db, showMessage, leagues, teams, players, 
    getLeagueName, getPlayersByTeam, selectedDateFilter, selectedLeagueFilter,
    user, getMatchBadge, tournaments, selectedTournamentId 
}) => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [scoreHome, setScoreHome] = useState(0);
    const [scoreAway, setScoreAway] = useState(0);
    const [penaltyWinnerId, setPenaltyWinnerId] = useState('');
    const [scorers, setScorers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const handleEditMatch = (match) => {
        setSelectedMatch(match);
        setScoreHome(match.scoreHome !== null && match.scoreHome !== undefined ? match.scoreHome : 0);
        setScoreAway(match.scoreAway !== null && match.scoreAway !== undefined ? match.scoreAway : 0);
        setPenaltyWinnerId(match.penaltyWinnerId || '');
        setScorers(match.scorers || []);
        setIsEditing(true);
    };

    const updatePlayoffFinalists = async (leagueId) => {
        try {
            const matchesRef = collection(db, `artifacts/${appId}/public/data/matches`);
            const q = query(matchesRef, where("leagueId", "==", leagueId));
            const snap = await getDocs(q);
            const leagueMatches = snap.docs.map(d => d.data());

            const activeTournamentObj = tournaments.find(t => t.id === selectedTournamentId);
            const tiebreakerRule = activeTournamentObj?.playoffTiebreakerRule || 'penalties';

            const sf1 = leagueMatches.find(m => m.playoffKey === 'SF1');
            const sf2 = leagueMatches.find(m => m.playoffKey === 'SF2');
            const finalMatch = leagueMatches.find(m => m.playoffKey === 'FINAL');
            const thirdMatch = leagueMatches.find(m => m.playoffKey === '3RD');

            if (!finalMatch || !thirdMatch) return;

            let winnerSF1 = null, loserSF1 = null;
            let winnerSF2 = null, loserSF2 = null;

            if (sf1 && sf1.scoreHome !== null && sf1.scoreAway !== null) {
                if (sf1.scoreHome > sf1.scoreAway) {
                    winnerSF1 = sf1.homeTeamId; loserSF1 = sf1.awayTeamId;
                } else if (sf1.scoreAway > sf1.scoreHome) {
                    winnerSF1 = sf1.awayTeamId; loserSF1 = sf1.homeTeamId;
                } else {
                    if (tiebreakerRule === 'penalties' && sf1.penaltyWinnerId) {
                        winnerSF1 = sf1.penaltyWinnerId;
                        loserSF1 = sf1.penaltyWinnerId === sf1.homeTeamId ? sf1.awayTeamId : sf1.homeTeamId;
                    } else {
                        winnerSF1 = (sf1.seedHome || 1) <= (sf1.seedAway || 4) ? sf1.homeTeamId : sf1.awayTeamId;
                        loserSF1 = winnerSF1 === sf1.homeTeamId ? sf1.awayTeamId : sf1.homeTeamId;
                    }
                }
            }

            if (sf2 && sf2.scoreHome !== null && sf2.scoreAway !== null) {
                if (sf2.scoreHome > sf2.scoreAway) {
                    winnerSF2 = sf2.homeTeamId; loserSF2 = sf2.awayTeamId;
                } else if (sf2.scoreAway > sf2.scoreHome) {
                    winnerSF2 = sf2.awayTeamId; loserSF2 = sf2.homeTeamId;
                } else {
                    if (tiebreakerRule === 'penalties' && sf2.penaltyWinnerId) {
                        winnerSF2 = sf2.penaltyWinnerId;
                        loserSF2 = sf2.penaltyWinnerId === sf2.homeTeamId ? sf2.awayTeamId : sf2.homeTeamId;
                    } else {
                        winnerSF2 = (sf2.seedHome || 2) <= (sf2.seedAway || 3) ? sf2.homeTeamId : sf2.awayTeamId;
                        loserSF2 = winnerSF2 === sf2.homeTeamId ? sf2.awayTeamId : sf2.homeTeamId;
                    }
                }
            }

            if (winnerSF1 && winnerSF2) {
                await updateDoc(doc(db, `artifacts/${appId}/public/data/matches`, finalMatch.id), {
                    homeTeamId: winnerSF1,
                    awayTeamId: winnerSF2
                });
            }

            if (loserSF1 && loserSF2) {
                await updateDoc(doc(db, `artifacts/${appId}/public/data/matches`, thirdMatch.id), {
                    homeTeamId: loserSF1,
                    awayTeamId: loserSF2
                });
            }
        } catch (err) {
            console.error("Error al actualizar finalistas de Liguilla:", err);
        }
    };

    const handleSaveMatch = async () => {
        if (!selectedMatch) return;

        const isPlayoffMatch = Boolean(selectedMatch.stage);
        if (isPlayoffMatch && scoreHome === scoreAway && !penaltyWinnerId) {
            showMessage("En partidos de Liguilla / Eliminatoria con empate, debes seleccionar al equipo ganador en penales.");
            return;
        }

        const validScorers = scorers.filter(s => s.playerId && s.count > 0);
        const matchDataToSave = {
            ...selectedMatch,
            scoreHome,
            scoreAway,
            penaltyWinnerId: scoreHome === scoreAway ? penaltyWinnerId : null,
            scorers: validScorers,
            status: 'Jugado'
        };

        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/matches`, selectedMatch.id), matchDataToSave);
            
            if (isPlayoffMatch && selectedMatch.playoffKey?.startsWith('SF')) {
                await updatePlayoffFinalists(selectedMatch.leagueId);
            }

            setIsEditing(false);
            setSelectedMatch(null);
            showMessage("Resultado del partido guardado con éxito.");

            const homeTeamName = getTeamName(selectedMatch.homeTeamId);
            const awayTeamName = getTeamName(selectedMatch.awayTeamId);
            
            const homeScorers = validScorers.filter(s => s.teamId === selectedMatch.homeTeamId);
            const awayScorers = validScorers.filter(s => s.teamId === selectedMatch.awayTeamId);

            const getPlayerName = (pId) => players.find(p => p.id === pId)?.name || 'Desconocido';

            let scorersMessage = "\n*Anotadores / Goleadores:*\n";
            if (homeScorers.length > 0) {
                scorersMessage += `*${homeTeamName}:*\n`;
                homeScorers.forEach(s => {
                    scorersMessage += `- ${getPlayerName(s.playerId)} (${s.count})\n`;
                });
            }
            if (awayScorers.length > 0) {
                scorersMessage += `*${awayTeamName}:*\n`;
                awayScorers.forEach(s => {
                    scorersMessage += `- ${getPlayerName(s.playerId)} (${s.count})\n`;
                });
            }
            
            if (homeScorers.length === 0 && awayScorers.length === 0) {
                scorersMessage = "\nSin anotadores registrados.";
            }

            const notificationMessage = `*Resultado de Partido Registrado*\n\n` +
                `*Liga:* ${getLeagueName(selectedMatch.leagueId)}\n` + 
                `*Fecha:* ${selectedMatch.date}\n\n` + 
                `*Resultado Final:*\n` + 
                `${homeTeamName} *${scoreHome} - ${scoreAway}* ${awayTeamName}\n` + 
                `${scorersMessage}`;

            sendTelegramNotification(notificationMessage, user?.email);

        } catch (e) {
            console.error("Error al guardar el partido:", e);
            showMessage("Error al guardar el partido.");
        }
    };

    const handleAddScorer = (teamId) => {
        setScorers(prev => [...prev, { playerId: '', teamId, count: 1 }]);
    };

    const handleScorerChange = (index, field, value) => {
        const newScorers = [...scorers];
        newScorers[index][field] = value;
        setScorers(newScorers);
    };

    const handleRemoveScorer = (index) => {
        setScorers(prev => prev.filter((_, i) => i !== index));
    };

    const handleNullifyMatch = async () => {
        if (!selectedMatch) return;
        if (confirm("¿Estás seguro de que quieres anular este partido? Se registrará como un empate 0-0 y se borrarán los goleadores.")) {
            try {
                await setDoc(doc(db, `artifacts/${appId}/public/data/matches`, selectedMatch.id), {
                    ...selectedMatch,
                    scoreHome: 0,
                    scoreAway: 0,
                    scorers: [],
                    status: 'Anulado'
                });
                setIsEditing(false);
                setSelectedMatch(null);
                showMessage("Partido anulado con éxito (Empate 0-0).");

                const notificationMessage = `*Partido Anulado*\n\n` +
                    `*Liga:* ${getLeagueName(selectedMatch.leagueId)}\n` +
                    `*Fecha:* ${selectedMatch.date}\n\n` +
                    `*Partido:*\n` +
                    `${getTeamName(selectedMatch.homeTeamId)} vs ${getTeamName(selectedMatch.awayTeamId)}\n\n` +
                    `El partido ha sido anulado y registrado como un empate 0-0.`;

                sendTelegramNotification(notificationMessage, user?.email);
            } catch (e) {
                console.error("Error al anular el partido:", e);
                showMessage("Error al anular el partido.");
            }
        }
    };

    const filteredMatches = matches.filter(match => {
        const dateMatch = selectedDateFilter ? match.date === selectedDateFilter : true;
        const leagueMatch = selectedLeagueFilter ? match.leagueId === selectedLeagueFilter : true;
        return dateMatch && leagueMatch;
    });

    const sortedMatches = [...filteredMatches].sort((a, b) => new Date(a.date) - new Date(b.date));

    const sportIcon = (sport) => {
        const icons = { 'Fútbol': '⚽️', 'Básquetbol': '🏀', 'Tocho': '🏈', 'Voleibol': '🏐' };
        return icons[sport] || '🏆';
    };

    return (
        <div className="space-y-4">
            {isEditing && selectedMatch ? (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg space-y-4 border-t-4 border-[#101097]">
                    <h4 className="text-xl font-bold">Editar Partido</h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <strong>{getLeagueName(selectedMatch.leagueId)}</strong>
                        <br />
                        {getTeamName(selectedMatch.homeTeamId)} vs {getTeamName(selectedMatch.awayTeamId)} ({selectedMatch.date})
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Local ({getTeamName(selectedMatch.homeTeamId)}):</label>
                            <input type="number" min="0" value={scoreHome} onChange={(e) => setScoreHome(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-20 p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-center text-lg" />
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Visitante ({getTeamName(selectedMatch.awayTeamId)}):</label>
                            <input type="number" min="0" value={scoreAway} onChange={(e) => setScoreAway(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-20 p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-center text-lg" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{getSportTerms(leagues.find(l => l.id === selectedMatch.leagueId)?.sport).scorerPlural}</h5>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleAddScorer(selectedMatch.homeTeamId)} className="btn-primary text-xs py-2 px-3">{getSportTerms(leagues.find(l => l.id === selectedMatch.leagueId)?.sport).addHomeBtn}</button>
                            <button onClick={() => handleAddScorer(selectedMatch.awayTeamId)} className="btn-primary text-xs py-2 px-3">{getSportTerms(leagues.find(l => l.id === selectedMatch.leagueId)?.sport).addAwayBtn}</button>
                        </div>
                        {scorers.map((scorer, index) => (
                            <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-gray-200 dark:border-gray-600">
                                <select value={scorer.playerId} onChange={(e) => handleScorerChange(index, 'playerId', e.target.value)} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold flex-1 min-w-[160px]">
                                    <option value="">Selecciona un jugador</option>
                                    {getPlayersByTeam(scorer.teamId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" min="1" value={scorer.count} onChange={(e) => handleScorerChange(index, 'count', parseInt(e.target.value, 10) || 1)} className="w-16 p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold text-center" />
                                <button onClick={() => handleRemoveScorer(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors ml-auto"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>

                    {selectedMatch.stage && parseInt(scoreHome, 10) === parseInt(scoreAway, 10) && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1.5 mt-3">
                            <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                                🥅 Definición por Penales (Marcador Empatado):
                            </label>
                            <select
                                value={penaltyWinnerId}
                                onChange={(e) => setPenaltyWinnerId(e.target.value)}
                                className="w-full p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                            >
                                <option value="">-- Seleccionar Ganador en Penales --</option>
                                <option value={selectedMatch.homeTeamId}>Gana {getTeamName(selectedMatch.homeTeamId)} en Penales</option>
                                <option value={selectedMatch.awayTeamId}>Gana {getTeamName(selectedMatch.awayTeamId)} en Penales</option>
                            </select>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <button onClick={handleNullifyMatch} className="btn-danger text-xs px-3 py-2">Anular (0-0)</button>
                        <button onClick={() => setIsEditing(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">Cancelar</button>
                        <button onClick={handleSaveMatch} className="btn-primary text-xs px-4 py-2">Guardar Cambios</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {leagues.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay partidos para mostrar. Por favor, crea las ligas y genera el calendario.</p>
                    ) : (
                        sortedMatches.map(match => (
                            <div key={match.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700/50">
                                <div>
                                    <p className="font-bold text-base flex flex-wrap items-center gap-1.5 text-[#101097] dark:text-blue-300">
                                        <span className="text-lg">{sportIcon(leagues.find(l => l.id === match.leagueId)?.sport)}</span>
                                        <span>{getLeagueName(match.leagueId)}</span>
                                    </p>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs flex flex-wrap items-center gap-2 mt-1">
                                        <span>📅 {match.date}</span>
                                        {getMatchBadge && getMatchBadge(match.date, match.stage)}
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-extrabold text-base sm:text-lg mt-2">
                                        {getTeamName(match.homeTeamId)} <span className="text-xs text-gray-400 font-normal">vs</span> {getTeamName(match.awayTeamId)}
                                    </p>
                                    {match.status === 'Anulado' && <p className="text-[#CE0E2D] dark:text-red-400 font-bold text-xs mt-1">PARTIDO ANULADO</p>}
                                    {match.scoreHome !== null && match.scoreHome !== undefined && (
                                        <p className="text-[#101097] dark:text-blue-300 font-black text-lg mt-1">
                                            Marcador: {match.scoreHome} - {match.scoreAway}
                                        </p>
                                    )}
                                </div>
                                {user && (
                                    <div className="self-end sm:self-center">
                                        <button onClick={() => handleEditMatch(match)} className="text-[#101097] hover:text-[#001E61] dark:text-blue-300 dark:hover:text-blue-200 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-sm text-xs font-bold flex items-center gap-1">
                                            <PencilIcon className="w-4 h-4" /> <span>Editar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MatchesView;
