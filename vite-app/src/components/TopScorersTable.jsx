import React from 'react';
import { getSportTerms } from '../config/constants';

export const TopScorersTable = ({ scorers, sport }) => {
    const terms = getSportTerms(sport);
    if (!scorers || scorers.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay {terms.scorerPlural.toLowerCase()} registrados.</p>;
    }
    return (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Jugador</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">Equipo</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider">{terms.scorerHeader}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {scorers.map((scorer, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{scorer.playerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{scorer.teamName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-900 dark:text-white">{scorer.goals}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TopScorersTable;
