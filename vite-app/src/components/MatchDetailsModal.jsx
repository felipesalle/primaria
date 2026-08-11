import React from 'react';
import { getSportTerms } from '../config/constants';

export const MatchDetailsModal = ({ match, leagues, onClose, getPlayerName, getTeamName }) => {
    if (!match) return null;
    const league = leagues?.find(l => l.id === match.leagueId);
    const terms = getSportTerms(league?.sport);
    const homeScorers = match.scorers?.filter(s => s.teamId === match.homeTeamId) || [];
    const awayScorers = match.scorers?.filter(s => s.teamId === match.awayTeamId) || [];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full text-left border-t-4 border-[#101097]" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-2xl font-bold">{getTeamName(match.homeTeamId)} <span className="text-[#101097] dark:text-blue-300">{match.scoreHome} - {match.scoreAway}</span> {getTeamName(match.awayTeamId)}</h3>
                </div>
                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Detalle de {terms.scorerPlural}</h4>
                {match.scorers?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-bold text-gray-900 dark:text-white">{getTeamName(match.homeTeamId)}</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {homeScorers.map((scorer, i) => <li key={i}>{getPlayerName(scorer.playerId)} ({scorer.count})</li>)}
                            </ul>
                            {homeScorers.length === 0 && <p className="text-xs text-gray-400">Sin {terms.scorerPlural.toLowerCase()}.</p>}
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 dark:text-white">{getTeamName(match.awayTeamId)}</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {awayScorers.map((scorer, i) => <li key={i}>{getPlayerName(scorer.playerId)} ({scorer.count})</li>)}
                            </ul>
                            {awayScorers.length === 0 && <p className="text-xs text-gray-400">Sin {terms.scorerPlural.toLowerCase()}.</p>}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-3">{terms.noScorersMsg}</p>
                )}
                <div className="text-right mt-6">
                    <button onClick={onClose} className="btn-primary">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default MatchDetailsModal;
