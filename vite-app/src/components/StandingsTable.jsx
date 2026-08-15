import React from 'react';
import { getSportTerms } from '../config/constants';

export const StandingsTable = ({ standings, sport, onViewTeamDetails }) => {
    if (!standings || standings.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay datos de clasificación para esta liga.</p>;
    }
    const terms = getSportTerms(sport);
    const headers = ['Pos', 'Equipo', 'PJ', 'G', 'E', 'P', terms.unitShort === 'PTS' ? 'PF' : 'GF', terms.unitShort === 'PTS' ? 'PC' : 'GC', 'DG', 'Pts'];
    
    const getPodiumStyles = (index) => {
        if (index === 0) return "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-amber-400 font-bold dark:from-amber-500/20 hover:translate-x-1 transition-all duration-200";
        if (index === 1) return "bg-gradient-to-r from-slate-400/10 via-slate-300/5 to-transparent border-l-4 border-slate-300 font-bold dark:from-slate-400/20 hover:translate-x-1 transition-all duration-200";
        if (index === 2) return "bg-gradient-to-r from-amber-800/10 via-amber-700/5 to-transparent border-l-4 border-amber-700 font-bold dark:from-amber-800/20 hover:translate-x-1 transition-all duration-200";
        return "hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:translate-x-1 transition-all duration-200";
    };

    const getPodiumBadge = (index) => {
        if (index === 0) return <span className="mr-1 text-lg">🥇</span>;
        if (index === 1) return <span className="mr-1 text-lg">🥈</span>;
        if (index === 2) return <span className="mr-1 text-lg">🥉</span>;
        return <span className="text-sm text-gray-400 dark:text-gray-500 font-bold w-5 inline-block text-center">{index + 1}</span>;
    };

    return (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100/80 dark:bg-gray-700/70">
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={header} className={`px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider ${idx <= 1 ? 'text-left' : 'text-center'}`}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700/80">
                    {standings.map((team, index) => (
                        <tr key={index} className={getPodiumStyles(index)}>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm text-center font-bold">{getPodiumBadge(index)}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                                <div className="flex items-center cursor-pointer group" onClick={() => onViewTeamDetails && onViewTeamDetails(team.id)}>
                                    <img 
                                        src={team.logoUrl} 
                                        alt={`Logo de ${team.teamName}`} 
                                        referrerPolicy="no-referrer" 
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-3 shadow-md object-contain bg-white border border-gray-200 dark:border-gray-600" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.teamName || 'EQ')}&background=101097&color=fff&rounded=true`; }} 
                                    />
                                    <span className="group-hover:text-[#101097] dark:group-hover:text-blue-300 transition-colors">{team.teamName}</span>
                                </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.played}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.wins}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.draws}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.losses}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.goalsFor}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.goalsAgainst}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 font-semibold">{team.goalDifference}</td>
                            <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap text-base sm:text-lg text-center font-black text-[#101097] dark:text-blue-300">{team.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StandingsTable;
