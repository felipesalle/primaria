import React from 'react';

export const ResultsList = ({ matches, getTeamName, getTeamLogo, onMatchClick, onViewTeamDetails, getMatchBadge }) => {
    const recentMatches = matches.filter(m => m.scoreHome !== null).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (recentMatches.length === 0) {
        return <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No hay resultados recientes.</p>;
    }
    return (
        <div className="space-y-3 mt-4">
            {recentMatches.map(match => (
                <div key={match.id} onClick={() => onMatchClick(match)} className="bg-white dark:bg-gray-800 p-3.5 sm:p-4 rounded-2xl hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700/80 cursor-pointer transition-all duration-200 shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-300">
                        <span>📅 {new Date(match.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        {getMatchBadge && getMatchBadge(match.date)}
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                        <div className="flex-1 text-sm sm:text-base md:text-lg font-black flex items-center cursor-pointer group" onClick={(e) => { e.stopPropagation(); onViewTeamDetails && onViewTeamDetails(match.homeTeamId); }}>
                            <img src={getTeamLogo(match.homeTeamId)} referrerPolicy="no-referrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full mr-2.5 shadow-md object-contain bg-white border border-gray-200 dark:border-gray-600" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(match.homeTeamId))}&background=101097&color=fff&rounded=true`; }} />
                            <span className="group-hover:text-[#101097] dark:group-hover:text-blue-300 transition-colors">{getTeamName(match.homeTeamId)}</span>
                        </div>
                        <span className="text-base sm:text-lg md:text-xl font-black px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-[#101097] dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-xs whitespace-nowrap">{match.scoreHome} - {match.scoreAway}</span>
                        <div className="flex-1 text-sm sm:text-base md:text-lg font-black flex items-center justify-end text-right cursor-pointer group" onClick={(e) => { e.stopPropagation(); onViewTeamDetails && onViewTeamDetails(match.awayTeamId); }}>
                            <span className="group-hover:text-[#101097] dark:group-hover:text-blue-300 transition-colors">{getTeamName(match.awayTeamId)}</span>
                            <img src={getTeamLogo(match.awayTeamId)} referrerPolicy="no-referrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full ml-2.5 shadow-md object-contain bg-white border border-gray-200 dark:border-gray-600" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(match.awayTeamId))}&background=101097&color=fff&rounded=true`; }} />
                        </div>
                    </div>
                    {match.status === 'Anulado' && <p className="text-center text-xs sm:text-sm text-[#CE0E2D] dark:text-red-400 font-extrabold mt-1.5">PARTIDO ANULADO (0-0)</p>}
                </div>
            ))}
        </div>
    );
};

export default ResultsList;
