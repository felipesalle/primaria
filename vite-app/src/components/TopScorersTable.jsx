import React from 'react';
import { getSportTerms } from '../config/constants';

export const TopScorersTable = ({ scorers, sport }) => {
    const terms = getSportTerms(sport);
    if (!scorers || scorers.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay {terms.scorerPlural.toLowerCase()} registrados.</p>;
    }
    return (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100/80 dark:bg-gray-700/70">
                    <tr>
                        <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Jugador</th>
                        <th className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Equipo</th>
                        <th className="px-4 sm:px-6 py-3.5 text-center text-xs sm:text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">{terms.scorerHeader}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700/80">
                    {scorers.map((scorer, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">{scorer.playerName}</td>
                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200">{scorer.teamName}</td>
                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-base sm:text-lg font-black text-center text-[#101097] dark:text-blue-300">{scorer.goals}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TopScorersTable;
