import React from 'react';

export const TeamDetailView = ({ teamId, teams, players, matches, getLeagueName, getTeamName, getTeamLogo, onViewMatchDetails, onBack }) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Equipo no encontrado.</p>;

    const teamPlayers = players.filter(p => p.teamId === teamId);
    const teamUpcomingMatches = matches.filter(m =>
        (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
        new Date(m.date) >= new Date() &&
        m.scoreHome === null
    ).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);

    return (
        <div className="p-4 space-y-6">
            <button onClick={onBack} className="btn-primary mb-4">← Volver a Clasificaciones</button>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 border-t-4 border-[#101097]">
                <div className="flex items-center space-x-4">
                    <img src={team.logoUrl} alt={`Logo de ${team.name}`} className="w-20 h-20 rounded-full shadow-md object-contain bg-white" />
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">Liga: {getLeagueName(team.leagueId)}</p>
                    </div>
                </div>

                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">Integrantes</h4>
                {teamPlayers.length > 0 ? (
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                        {teamPlayers.map(player => <li key={player.id}>{player.name} <span className="text-xs text-gray-500">({player.group})</span></li>)}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay jugadores registrados para este equipo.</p>
                )}

                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">Próximos Partidos</h4>
                {teamUpcomingMatches.length > 0 ? (
                    <div className="space-y-3">
                        {teamUpcomingMatches.map(match => (
                            <div key={match.id} onClick={() => onViewMatchDetails(match)} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex-1 text-sm font-bold flex items-center">
                                        <img src={getTeamLogo(match.homeTeamId)} className="w-5 h-5 rounded-full mr-2 shadow-sm object-contain bg-white" />
                                        {getTeamName(match.homeTeamId)}
                                    </div>
                                    <span className="text-lg font-extrabold mx-3 text-[#101097] dark:text-blue-300">vs</span>
                                    <div className="flex-1 text-sm font-bold flex items-center justify-end text-right">
                                        {getTeamName(match.awayTeamId)}
                                        <img src={getTeamLogo(match.awayTeamId)} className="w-5 h-5 rounded-full ml-2 shadow-sm object-contain bg-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay próximos partidos programados para este equipo.</p>
                )}
            </div>
        </div>
    );
};

export default TeamDetailView;
