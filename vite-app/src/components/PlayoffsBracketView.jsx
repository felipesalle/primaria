import React, { useState, useEffect } from 'react';
import { sortLeagues } from '../config/constants';

export const PlayoffsBracketView = ({ leagues = [], teams = [], matches = [], selectedTournamentId, onViewTeamDetails }) => {
    const visibleLeagues = leagues.filter(l => l.tournamentId === selectedTournamentId).sort(sortLeagues);

    const [selectedPlayoffLeagueId, setSelectedPlayoffLeagueId] = useState(visibleLeagues.length > 0 ? visibleLeagues[0].id : '');

    useEffect(() => {
        if (!selectedPlayoffLeagueId && visibleLeagues.length > 0) {
            setSelectedPlayoffLeagueId(visibleLeagues[0].id);
        }
    }, [visibleLeagues, selectedPlayoffLeagueId]);

    const activeLeague = visibleLeagues.find(l => l.id === selectedPlayoffLeagueId) || visibleLeagues[0];

    const getTeam = (teamId) => teams.find(t => t.id === teamId) || { name: 'Por Definir', logoUrl: '' };

    const playoffMatches = matches.filter(m => m.leagueId === activeLeague?.id && m.stage);

    const sf1 = playoffMatches.find(m => m.playoffKey === 'SF1');
    const sf2 = playoffMatches.find(m => m.playoffKey === 'SF2');
    const finalMatch = playoffMatches.find(m => m.playoffKey === 'FINAL');
    const thirdMatch = playoffMatches.find(m => m.playoffKey === '3RD');

    let championTeam = null;
    let thirdTeam = null;

    if (finalMatch && finalMatch.scoreHome !== null && finalMatch.scoreAway !== null) {
        if (finalMatch.scoreHome > finalMatch.scoreAway) championTeam = getTeam(finalMatch.homeTeamId);
        else if (finalMatch.scoreAway > finalMatch.scoreHome) championTeam = getTeam(finalMatch.awayTeamId);
        else if (finalMatch.penaltyWinnerId) championTeam = getTeam(finalMatch.penaltyWinnerId);
    }

    if (thirdMatch && thirdMatch.scoreHome !== null && thirdMatch.scoreAway !== null) {
        if (thirdMatch.scoreHome > thirdMatch.scoreAway) thirdTeam = getTeam(thirdMatch.homeTeamId);
        else if (thirdMatch.scoreAway > thirdMatch.scoreHome) thirdTeam = getTeam(thirdMatch.awayTeamId);
        else if (thirdMatch.penaltyWinnerId) thirdTeam = getTeam(thirdMatch.penaltyWinnerId);
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#101097] via-indigo-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
                            <span>🏆 FASE FINAL / PLAYOFFS</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">Liguilla por el Título</h2>
                        <p className="text-blue-100 text-xs sm:text-sm">Semifinales, Partido por el 3er Lugar y Gran Final.</p>
                    </div>

                    {visibleLeagues.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                            <label className="text-xs font-bold text-blue-200 block mb-1 uppercase tracking-wider">Seleccionar Liga:</label>
                            <select
                                value={selectedPlayoffLeagueId}
                                onChange={e => setSelectedPlayoffLeagueId(e.target.value)}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                {visibleLeagues.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.sport})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {championTeam && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-6 sm:p-8 rounded-3xl shadow-2xl text-gray-900 text-center border-4 border-amber-300">
                    <div className="text-5xl sm:text-7xl mb-2">👑 🏆 👑</div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-950">¡CAMPEÓN DEL TORNEO DE {activeLeague?.sport?.toUpperCase()}!</p>
                    <h3 className="text-3xl sm:text-5xl font-black font-outfit text-gray-950 drop-shadow-md my-2 flex items-center justify-center gap-3">
                        {championTeam.logoUrl && <img src={championTeam.logoUrl} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md object-contain" />}
                        {championTeam.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-900">¡Felicidades a todos los jugadores e integrantes del equipo!</p>
                </div>
            )}

            {playoffMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <h4 className="text-lg font-black font-outfit text-[#101097] dark:text-blue-300 flex items-center justify-between border-b dark:border-gray-700 pb-2">
                            <span>🔥 Semifinales</span>
                            <span className="text-xs font-semibold text-gray-500">1° vs 4° & 2° vs 3°</span>
                        </h4>

                        {sf1 && (
                            <div className="bg-gradient-to-br from-gray-50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-700 p-4 rounded-2xl border border-orange-200 dark:border-gray-600 shadow-sm space-y-2">
                                <span className="text-[10px] font-extrabold uppercase text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded-full">Semifinal 1 ({sf1.date})</span>
                                <div className="space-y-1.5 pt-1">
                                    <div className={`flex items-center justify-between font-bold text-sm ${sf1.scoreHome > sf1.scoreAway || sf1.penaltyWinnerId === sf1.homeTeamId ? 'text-[#101097] dark:text-amber-300 font-black' : ''}`}>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(sf1.homeTeamId)}>
                                            <span className="text-xs font-black text-gray-400">1°</span>
                                            {getTeam(sf1.homeTeamId).logoUrl && <img src={getTeam(sf1.homeTeamId).logoUrl} className="w-5 h-5 rounded-full object-contain bg-white shadow-sm" />}
                                            <span>{getTeam(sf1.homeTeamId).name}</span>
                                        </div>
                                        <span className="text-base font-extrabold">{sf1.scoreHome !== null ? sf1.scoreHome : '-'}</span>
                                    </div>
                                    <div className={`flex items-center justify-between font-bold text-sm ${sf1.scoreAway > sf1.scoreHome || sf1.penaltyWinnerId === sf1.awayTeamId ? 'text-[#101097] dark:text-amber-300 font-black' : ''}`}>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(sf1.awayTeamId)}>
                                            <span className="text-xs font-black text-gray-400">4°</span>
                                            {getTeam(sf1.awayTeamId).logoUrl && <img src={getTeam(sf1.awayTeamId).logoUrl} className="w-5 h-5 rounded-full object-contain bg-white shadow-sm" />}
                                            <span>{getTeam(sf1.awayTeamId).name}</span>
                                        </div>
                                        <span className="text-base font-extrabold">{sf1.scoreAway !== null ? sf1.scoreAway : '-'}</span>
                                    </div>
                                </div>
                                {sf1.penaltyWinnerId && <p className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold text-right">Gana {getTeam(sf1.penaltyWinnerId).name} en Penales 🥅</p>}
                            </div>
                        )}

                        {sf2 && (
                            <div className="bg-gradient-to-br from-gray-50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-700 p-4 rounded-2xl border border-orange-200 dark:border-gray-600 shadow-sm space-y-2">
                                <span className="text-[10px] font-extrabold uppercase text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded-full">Semifinal 2 ({sf2.date})</span>
                                <div className="space-y-1.5 pt-1">
                                    <div className={`flex items-center justify-between font-bold text-sm ${sf2.scoreHome > sf2.scoreAway || sf2.penaltyWinnerId === sf2.homeTeamId ? 'text-[#101097] dark:text-amber-300 font-black' : ''}`}>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(sf2.homeTeamId)}>
                                            <span className="text-xs font-black text-gray-400">2°</span>
                                            {getTeam(sf2.homeTeamId).logoUrl && <img src={getTeam(sf2.homeTeamId).logoUrl} className="w-5 h-5 rounded-full object-contain bg-white shadow-sm" />}
                                            <span>{getTeam(sf2.homeTeamId).name}</span>
                                        </div>
                                        <span className="text-base font-extrabold">{sf2.scoreHome !== null ? sf2.scoreHome : '-'}</span>
                                    </div>
                                    <div className={`flex items-center justify-between font-bold text-sm ${sf2.scoreAway > sf2.scoreHome || sf2.penaltyWinnerId === sf2.awayTeamId ? 'text-[#101097] dark:text-amber-300 font-black' : ''}`}>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(sf2.awayTeamId)}>
                                            <span className="text-xs font-black text-gray-400">3°</span>
                                            {getTeam(sf2.awayTeamId).logoUrl && <img src={getTeam(sf2.awayTeamId).logoUrl} className="w-5 h-5 rounded-full object-contain bg-white shadow-sm" />}
                                            <span>{getTeam(sf2.awayTeamId).name}</span>
                                        </div>
                                        <span className="text-base font-extrabold">{sf2.scoreAway !== null ? sf2.scoreAway : '-'}</span>
                                    </div>
                                </div>
                                {sf2.penaltyWinnerId && <p className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold text-right">Gana {getTeam(sf2.penaltyWinnerId).name} en Penales 🥅</p>}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-4 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-black font-outfit text-amber-700 dark:text-amber-400 flex items-center justify-between border-b dark:border-gray-700 pb-2">
                                <span>🥉 Partido por 3er Lugar</span>
                                <span className="text-xs font-semibold text-gray-500">Perdedores SF</span>
                            </h4>

                            {thirdMatch && (
                                <div className="bg-gradient-to-br from-gray-50 to-amber-50/50 dark:from-gray-700/50 dark:to-gray-700 p-5 rounded-2xl border border-amber-200 dark:border-gray-600 shadow-sm space-y-3 mt-4">
                                    <span className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">3er Lugar ({thirdMatch.date})</span>
                                    <div className="space-y-2 pt-1">
                                        <div className={`flex items-center justify-between font-bold text-sm ${thirdMatch.scoreHome > thirdMatch.scoreAway || thirdMatch.penaltyWinnerId === thirdMatch.homeTeamId ? 'text-amber-600 dark:text-amber-300 font-black' : ''}`}>
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(thirdMatch.homeTeamId)}>
                                                {getTeam(thirdMatch.homeTeamId).logoUrl && <img src={getTeam(thirdMatch.homeTeamId).logoUrl} className="w-6 h-6 rounded-full object-contain bg-white shadow-sm" />}
                                                <span>{getTeam(thirdMatch.homeTeamId).name}</span>
                                            </div>
                                            <span className="text-lg font-black">{thirdMatch.scoreHome !== null ? thirdMatch.scoreHome : '-'}</span>
                                        </div>
                                        <div className={`flex items-center justify-between font-bold text-sm ${thirdMatch.scoreAway > thirdMatch.scoreHome || thirdMatch.penaltyWinnerId === thirdMatch.awayTeamId ? 'text-amber-600 dark:text-amber-300 font-black' : ''}`}>
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(thirdMatch.awayTeamId)}>
                                                {getTeam(thirdMatch.awayTeamId).logoUrl && <img src={getTeam(thirdMatch.awayTeamId).logoUrl} className="w-6 h-6 rounded-full object-contain bg-white shadow-sm" />}
                                                <span>{getTeam(thirdMatch.awayTeamId).name}</span>
                                            </div>
                                            <span className="text-lg font-black">{thirdMatch.scoreAway !== null ? thirdMatch.scoreAway : '-'}</span>
                                        </div>
                                    </div>
                                    {thirdTeam && (
                                        <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-xl border border-amber-300 dark:border-amber-700 text-center">
                                            <p className="text-xs font-black text-amber-900 dark:text-amber-200">🥉 3er Lugar: {thirdTeam.name}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-xl border-2 border-amber-400 dark:border-amber-500 space-y-4 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-black font-outfit text-purple-700 dark:text-purple-300 flex items-center justify-between border-b dark:border-gray-700 pb-2">
                                <span>👑 Gran Final</span>
                                <span className="text-xs font-semibold text-gray-500">Ganadores SF</span>
                            </h4>

                            {finalMatch && (
                                <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-amber-50 dark:from-purple-950/40 dark:to-gray-700 p-5 rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-md space-y-3 mt-4">
                                    <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full">Gran Final ({finalMatch.date})</span>
                                    <div className="space-y-2 pt-1">
                                        <div className={`flex items-center justify-between font-bold text-base ${finalMatch.scoreHome > finalMatch.scoreAway || finalMatch.penaltyWinnerId === finalMatch.homeTeamId ? 'text-amber-600 dark:text-amber-300 font-black' : ''}`}>
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(finalMatch.homeTeamId)}>
                                                {getTeam(finalMatch.homeTeamId).logoUrl && <img src={getTeam(finalMatch.homeTeamId).logoUrl} className="w-7 h-7 rounded-full object-contain bg-white shadow-sm" />}
                                                <span>{getTeam(finalMatch.homeTeamId).name}</span>
                                            </div>
                                            <span className="text-xl font-black">{finalMatch.scoreHome !== null ? finalMatch.scoreHome : '-'}</span>
                                        </div>
                                        <div className={`flex items-center justify-between font-bold text-base ${finalMatch.scoreAway > finalMatch.scoreHome || finalMatch.penaltyWinnerId === finalMatch.awayTeamId ? 'text-amber-600 dark:text-amber-300 font-black' : ''}`}>
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewTeamDetails && onViewTeamDetails(finalMatch.awayTeamId)}>
                                                {getTeam(finalMatch.awayTeamId).logoUrl && <img src={getTeam(finalMatch.awayTeamId).logoUrl} className="w-7 h-7 rounded-full object-contain bg-white shadow-sm" />}
                                                <span>{getTeam(finalMatch.awayTeamId).name}</span>
                                            </div>
                                            <span className="text-xl font-black">{finalMatch.scoreAway !== null ? finalMatch.scoreAway : '-'}</span>
                                        </div>
                                    </div>
                                    {championTeam && (
                                        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-3 rounded-xl shadow-md text-center text-gray-950 font-black">
                                            <p className="text-sm">👑 CAMPEÓN: {championTeam.name}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-700 space-y-2">
                    <p className="text-4xl">🏆</p>
                    <h4 className="text-xl font-bold font-outfit text-gray-800 dark:text-gray-200">Liguilla Final no programada aún</h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Al terminar la temporada regular de {activeLeague?.name}, el administrador generará las Semifinales y Gran Final para esta liga.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlayoffsBracketView;
