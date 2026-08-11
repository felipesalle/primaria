import React from 'react';

export const ResultsList = ({ matches, getTeamName, getTeamLogo, onMatchClick, onViewTeamDetails, getMatchBadge }) => {
    const recentMatches = matches.filter(m => m.scoreHome !== null).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (recentMatches.length === 0) {
        return <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No hay resultados recientes.</p>;
    }
    return (
        <div className="space-y-3 mt-4">
            {recentMatches.map(match => (
                <div key={match.id} onClick={() => onMatchClick(match)} className="bg-white dark:bg-gray-800/70 p-3 rounded-lg hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 shadow-md border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(match.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        {getMatchBadge && getMatchBadge(match.date)}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex-1 text-sm font-bold flex items-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewTeamDetails && onViewTeamDetails(match.homeTeamId); }}>
                            <img src={getTeamLogo(match.homeTeamId)} referrerPolicy="no-referrer" className="w-5 h-5 rounded-full mr-2 shadow-sm object-contain bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(match.homeTeamId))}&background=101097&color=fff&rounded=true`; }} />
                            {getTeamName(match.homeTeamId)}
                        </div>
                        <span className="text-lg font-extrabold mx-3 text-[#101097] dark:text-blue-300">{match.scoreHome} - {match.scoreAway}</span>
                        <div className="flex-1 text-sm font-bold flex items-center justify-end text-right cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewTeamDetails && onViewTeamDetails(match.awayTeamId); }}>
                            {getTeamName(match.awayTeamId)}
                            <img src={getTeamLogo(match.awayTeamId)} referrerPolicy="no-referrer" className="w-5 h-5 rounded-full ml-2 shadow-sm object-contain bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(match.awayTeamId))}&background=101097&color=fff&rounded=true`; }} />
                        </div>
                    </div>
                    {match.status === 'Anulado' && <p className="text-center text-xs text-[#CE0E2D] dark:text-red-400 font-bold mt-1">PARTIDO ANULADO</p>}
                </div>
            ))}
        </div>
    );
};

export default ResultsList;
