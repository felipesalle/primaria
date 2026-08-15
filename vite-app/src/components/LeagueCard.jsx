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
        <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 border border-gray-200/80 dark:border-slate-700/80 hover:shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black font-outfit text-gray-900 dark:text-white flex items-center tracking-tight">
                        <span className="mr-2.5 text-2xl sm:text-3xl">{sportIcon(league.sport)}</span>
                        {league.name}
                    </h4>
                    {hasSchedule && (
                        isLocked ? (
                            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border border-amber-300 dark:border-amber-700 shadow-sm" title="El calendario de partidos ya fue generado. Los equipos están protegidos.">
                                <span>🔒 Calendario Generado</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("⚠️ ADVERTENCIA: Esta liga ya tiene un calendario de partidos generado. ¿Estás seguro de que deseas desbloquear la edición de equipos? Modificar nombres o escudos podría alterar el historial de los partidos.")) {
                                            setIsUnlocked(true);
                                        }
                                    }} 
                                    className="ml-1 text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 underline hover:text-amber-700 transition-colors"
                                >
                                    Desbloquear 🔓
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border border-emerald-300 dark:border-emerald-700 shadow-sm">
                                <span>🔓 Edición Desbloqueada</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUnlocked(false);
                                    }} 
                                    className="ml-1 text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100 underline hover:text-emerald-700 transition-colors"
                                >
                                    Bloquear 🔒
                                </button>
                            </div>
                        )
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select value={league.theme || ''} onChange={handleThemeSelectChange} className="p-2.5 sm:p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-bold shadow-sm focus:ring-2 focus:ring-[#101097]" onClick={(e) => e.stopPropagation()}>
                        <option value="">-- Temática de Equipos --</option>
                        {themeOptions.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                    </select>
                    <select value={league.matchDay ?? ''} onChange={(e) => onMatchDayChange(league.id, e.target.value)} className="p-2.5 sm:p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-bold shadow-sm focus:ring-2 focus:ring-[#101097]" onClick={(e) => e.stopPropagation()}>
                        <option value="">-- Asignar Día --</option>
                        {dayOptions.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                    </select>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-slate-700 text-[#101097] hover:text-[#001E61] dark:text-blue-300 dark:hover:text-blue-200 font-extrabold text-sm sm:text-base shadow-xs transition-all flex items-center gap-1">
                        <span>{isExpanded ? 'Ocultar' : 'Ver Equipos'}</span>
                        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 space-y-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button onClick={handleApplyThemeClick} className={`btn-primary w-full sm:w-auto flex items-center justify-center text-sm sm:text-base font-bold py-3 px-5 shadow-md ${isLocked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} title="Cargar automáticamente los nombres y escudos oficiales de la temática seleccionada">
                            {isLocked ? '🔒 Cargar Equipos (Protegido)' : `⚡ Cargar Equipos de ${league.theme || 'la Temática'}`}
                        </button>
                        <button onClick={handleAdd} className="btn-primary w-full sm:w-auto flex items-center justify-center disabled:bg-gray-400 text-sm sm:text-base font-bold py-3 px-5 shadow-md" disabled={teams.length >= 6 || isLocked}>
                            <PlusIcon className="w-5 h-5 mr-2" />Añadir Equipo Personalizado
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {teams.map(team => (
                            <div key={team.id} className="bg-gray-50 dark:bg-slate-700/60 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3 border border-gray-200 dark:border-slate-600/60 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-3">
                                        <img src={team.logoUrl} alt={`Logo de ${team.name}`} referrerPolicy="no-referrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md object-contain bg-white border border-gray-200 dark:border-gray-600" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name || 'EQ')}&background=101097&color=fff&rounded=true`; }} />
                                        <span className="font-black text-base sm:text-lg text-gray-900 dark:text-white">{team.name}</span>
                                        <button onClick={() => handleEditTeamClick(team)} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title={isLocked ? "Equipos protegidos. Haz clic para desbloquear" : "Editar nombre o escudo"}>
                                            {isLocked ? <span className="text-sm">🔒</span> : <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </button>
                                        <button onClick={() => handleDelete(team.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:text-gray-400 disabled:hover:bg-transparent" disabled={teams.length <= 4 || isLocked}>
                                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                    <button onClick={() => onAddPlayers(team)} className="btn-primary text-xs sm:text-sm py-2 px-3.5 font-bold rounded-xl whitespace-nowrap">Añadir Jugadores</button>
                                </div>
                                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 space-y-1.5 text-sm sm:text-base font-semibold">
                                    {players.filter(p => p.teamId === team.id).length > 0 ? (
                                        players.filter(p => p.teamId === team.id).map(player => (
                                            <li key={player.id} className="flex items-center justify-between">
                                                <span>{player.name} <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal">({player.group})</span></span>
                                                <button onClick={() => handleDeletePlayer(player.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-400 dark:text-gray-400 italic">No hay jugadores registrados en este equipo.</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeagueCard;
