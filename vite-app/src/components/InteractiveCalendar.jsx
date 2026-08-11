import React, { useState, useMemo } from 'react';
import { isHolidayOrCTE } from '../config/constants';

export const InteractiveCalendar = ({ matches = [], selectedDateFilter = '', onSelectDate, activeTournament }) => {
    const [currentDate, setCurrentDate] = useState(() => new Date());

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const matchCountsByDate = useMemo(() => {
        const map = {};
        matches.forEach(m => {
            if (m.date) {
                map[m.date] = (map[m.date] || 0) + 1;
            }
        });
        return map;
    }, [matches]);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysGrid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        daysGrid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        daysGrid.push(day);
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b dark:border-gray-700 pb-2.5">
                <div className="flex items-center space-x-2.5">
                    <span className="text-xl">🗓️</span>
                    <div>
                        <h4 className="text-base font-bold font-outfit text-gray-900 dark:text-white">Calendario Interactivo de Jornadas</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Haz clic en cualquier fecha destacada para filtrar los partidos de esa jornada.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {selectedDateFilter && (
                        <button
                            onClick={() => onSelectDate('')}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition-all flex items-center shadow-sm"
                        >
                            ✕ Ver Todas ({selectedDateFilter})
                        </button>
                    )}
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button onClick={prevMonth} className="px-2 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded transition-all" title="Mes Anterior">←</button>
                        <span className="text-xs font-extrabold px-2 font-outfit min-w-[110px] text-center text-[#101097] dark:text-blue-300">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button onClick={nextMonth} className="px-2 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded transition-all" title="Siguiente Mes">→</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 py-0.5">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span className="text-[#101097] dark:text-blue-400 font-extrabold">Vie</span><span>Sáb</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysGrid.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="h-10 sm:h-11 rounded-lg bg-gray-50/40 dark:bg-gray-900/10"></div>;
                    }

                    const monthStr = String(currentMonth + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const dateString = `${currentYear}-${monthStr}-${dayStr}`;

                    const matchCount = matchCountsByDate[dateString] || 0;
                    const isSelected = selectedDateFilter === dateString;
                    const hasMatches = matchCount > 0;

                    const isFriendly = !activeTournament?.inaugurationDate || dateString < activeTournament.inaugurationDate;
                    const isInauguration = activeTournament?.inaugurationDate && dateString === activeTournament.inaugurationDate;

                    const isCTE = isHolidayOrCTE(dateString);

                    let bgStyle = 'bg-gradient-to-br from-blue-600 to-[#101097] text-white';
                    let badgeStyle = 'bg-white/25 text-white';
                    let dateTag = '';

                    if (isFriendly) {
                        bgStyle = 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
                        dateTag = '🤝 ';
                    } else if (isInauguration) {
                        bgStyle = 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white';
                        dateTag = '🎉 ';
                    }

                    if (isSelected) {
                        bgStyle = 'bg-[#101097] text-white shadow-md ring-2 ring-amber-400 font-black z-10 scale-105';
                        badgeStyle = 'bg-amber-400 text-gray-900';
                    }

                    return (
                        <button
                            key={dateString}
                            onClick={() => {
                                if (hasMatches) {
                                    onSelectDate(isSelected ? '' : dateString);
                                }
                            }}
                            disabled={!hasMatches}
                            className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 p-0.5 ${
                                hasMatches
                                    ? `${bgStyle} shadow-sm hover:scale-105 hover:shadow font-bold cursor-pointer`
                                    : isCTE
                                        ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-extrabold border border-rose-300 dark:border-rose-700 cursor-default'
                                        : 'bg-gray-50 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500 cursor-default opacity-50'
                            }`}
                            title={
                                hasMatches
                                    ? `${dateTag}${dateString}: ${matchCount} partido(s)`
                                    : isCTE
                                        ? `🚫 Viernes de CTE / Receso Escolar (${dateString}): Sin jornada programada`
                                        : ''
                            }
                        >
                            <span className="text-xs sm:text-sm leading-none flex items-center justify-center">
                                {hasMatches && dateTag && <span className="text-[10px] mr-0.5">{dateTag}</span>}
                                {day}
                            </span>
                            {hasMatches ? (
                                <span className={`text-[9px] px-1 py-0 rounded-full mt-0.5 font-extrabold leading-tight ${badgeStyle}`}>
                                    {matchCount} <span className="hidden sm:inline">{matchCount === 1 ? 'partido' : 'partidos'}</span><span className="sm:hidden">p.</span>
                                </span>
                            ) : isCTE ? (

                                <span className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-rose-600 text-white font-black mt-0.5 leading-none shadow-xs">
                                    🚫 CTE
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> 🤝 Amistoso</span>
                    <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> 🎉 Inauguración</span>
                    <span className="flex items-center gap-1 font-bold text-[#101097] dark:text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-[#101097] inline-block"></span> 🏆 Oficial</span>
                    <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> 🚫 CTE / Vacaciones</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveCalendar;
