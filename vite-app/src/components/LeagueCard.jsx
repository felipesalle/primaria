import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { PRESET_THEMES } from '../config/constants';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';

export const LeagueCard = ({ league, teams, players, matches = [], appId, db, showMessage, onMatchDayChange, onThemeChange, onApplyThemeTeams, onEditTeam, onAddPlayers, onAddTeam, onDeleteTeam }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const dayOptions = [ { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' }, { value: 3, label: 'Miércoles' }, { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }, { value: 0, label: 'Domingo' } ];
    const themeOptions = Object.keys(PRESET_THEMES);

    const hasSchedule = matches.some(m => m.leagueId === league.id);
    const isLocked = hasSchedule && !isUnlocked;

    const handleDeletePlayer = async (playerId) => {
        if (confirm("¿Estás seguro de que quieres eliminar a este jugador?")) {
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/players`, playerId));
                showMessage("Jugador eliminado con éxito.");
            } catch (e) { console.error("Error al eliminar jugador:", e); showMessage("Error al eliminar jugador."); }
        }
    };

    const handleAdd = () => {
        if (isLocked) {
            showMessage("🔒 No se pueden añadir equipos mientras la liga tenga un calendario generado. Haz clic en 'Desbloquear' arriba si necesitas realizar cambios.");
            return;
        }
        if (teams.length >= 6) {
            showMessage("Una liga no puede tener más de 6 equipos.");
            return;
        }
        onAddTeam(league.id);
    };

    const handleDelete = (teamId) => {
        if (isLocked) {
            showMessage("🔒 No se pueden eliminar equipos mientras la liga tenga un calendario generado. Haz clic en 'Desbloquear' arriba si necesitas realizar cambios.");
            return;
        }
        if (teams.length <= 4) {
            showMessage("Una liga debe tener al menos 4 equipos.");
            return;
        }
        onDeleteTeam(teamId);
    };

    const handleApplyThemeClick = () => {
        if (isLocked) {
            if (confirm("🔒 Esta liga tiene un calendario generado. Modificar los equipos de la temática puede alterar el historial de partidos. ¿Deseas desbloquear la edición y aplicar la temática de todas formas?")) {
                setIsUnlocked(true);
                onApplyThemeTeams(league.id, league.theme);
            }
            return;
        }
        onApplyThemeTeams(league.id, league.theme);
    };

    const handleEditTeamClick = (team) => {
        if (isLocked) {
            if (confirm("🔒 La edición de equipos está protegida porque ya existe un calendario generado. ¿Deseas desbloquear la edición para corregir este equipo?")) {
                setIsUnlocked(true);
                onEditTeam(team);
            }
            return;
        }
        onEditTeam(team);
    };

    const handleThemeSelectChange = (e) => {
        const newTheme = e.target.value;
        if (isLocked) {
            if (confirm("🔒 Cambiar la temática afectará los nombres de los equipos en un calendario existente. ¿Deseas desbloquear la edición y cambiar la temática?")) {
                setIsUnlocked(true);
                onThemeChange(league.id, newTheme);
            }
            return;
        }
        onThemeChange(league.id, newTheme);
    };

    const sportIcon = (sport) => {
        const icons = { 'Fútbol': '⚽️', 'Básquetbol': '🏀', 'Tocho': '🏈', 'Voleibol': '🏐' };
        return icons[sport] || '🏆';
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-inner transition-all duration-300 border border-gray-100 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <span className="mr-2 text-xl">{sportIcon(league.sport)}</span>
                        {league.name}
                    </h4>
                    {hasSchedule && (
                        isLocked ? (
                            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-300 dark:border-amber-700 shadow-sm" title="El calendario de partidos ya fue generado. Los equipos están protegidos.">
                                <span>🔒 Calendario Generado</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("⚠️ ADVERTENCIA: Esta liga ya tiene un calendario de partidos generado. ¿Estás seguro de que deseas desbloquear la edición de equipos? Modificar nombres o escudos podría alterar el historial de los partidos.")) {
                                            setIsUnlocked(true);
                                        }
                                    }} 
                                    className="ml-1 text-xs font-black text-amber-900 dark:text-amber-100 underline hover:text-amber-600 transition-colors"
                                >
                                    Desbloquear 🔓
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-sm">
                                <span>🔓 Edición Desbloqueada</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUnlocked(false);
                                    }} 
                                    className="ml-1 text-xs font-black text-emerald-900 dark:text-emerald-100 underline hover:text-emerald-600 transition-colors"
                                >
                                    Bloquear 🔒
                                </button>
                            </div>
                        )
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select value={league.theme || ''} onChange={handleThemeSelectChange} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm font-semibold shadow-sm" onClick={(e) => e.stopPropagation()}>
                        <option value="">-- Temática de Equipos --</option>
                        {themeOptions.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                    </select>
                    <select value={league.matchDay ?? ''} onChange={(e) => onMatchDayChange(league.id, e.target.value)} className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm font-semibold shadow-sm" onClick={(e) => e.stopPropagation()}>
                        <option value="">-- Asignar Día --</option>
                        {dayOptions.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                    </select>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#101097] hover:text-[#001E61] dark:text-blue-300 dark:hover:text-blue-200 p-1 font-bold text-lg">
                        {isExpanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 space-y-4">
                    <div className="border-t dark:border-gray-700 pt-4 flex flex-col sm:flex-row items-center gap-3">
                        <button onClick={handleApplyThemeClick} className={`btn-primary w-full sm:w-auto flex items-center justify-center text-xs sm:text-sm py-2 px-4 shadow-md ${isLocked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} title="Cargar automáticamente los nombres y escudos oficiales de la temática seleccionada">
                            {isLocked ? '🔒 Cargar Equipos (Protegido)' : `⚡ Cargar Equipos de ${league.theme || 'la Temática'}`}
                        </button>
                        <button onClick={handleAdd} className="btn-primary w-full sm:w-auto flex items-center justify-center disabled:bg-gray-400 text-xs sm:text-sm py-2 px-4 shadow-md" disabled={teams.length >= 6 || isLocked}>
                            <PlusIcon className="w-4 h-4 mr-1.5" />Añadir Equipo Personalizado
                        </button>
                    </div>
                    {teams.map(team => (
                        <div key={team.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <img src={team.logoUrl} alt={`Logo de ${team.name}`} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full shadow-md object-contain bg-white border border-gray-200" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name || 'EQ')}&background=101097&color=fff&rounded=true`; }} />
                                    <span className="font-bold text-gray-900 dark:text-white">{team.name}</span>
                                    <button onClick={() => handleEditTeamClick(team)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title={isLocked ? "Equipos protegidos. Haz clic para desbloquear" : "Editar nombre o escudo"}>
                                        {isLocked ? <span className="text-xs">🔒</span> : <PencilIcon className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(team.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent" disabled={teams.length <= 4 || isLocked}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={() => onAddPlayers(team)} className="btn-primary text-xs py-1.5 px-3">Añadir Jugadores</button>
                            </div>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
                                {players.filter(p => p.teamId === team.id).length > 0 ? (
                                    players.filter(p => p.teamId === team.id).map(player => (
                                        <li key={player.id} className="flex items-center justify-between">
                                            <span>{player.name} <span className="text-xs text-gray-500">({player.group})</span></span>
                                            <button onClick={() => handleDeletePlayer(player.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-400">No hay jugadores en este equipo.</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeagueCard;
