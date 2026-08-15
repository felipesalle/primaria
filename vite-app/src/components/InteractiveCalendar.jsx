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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-gray-700 pb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl sm:text-3xl">🗓️</span>
                    <div>
                        <h4 className="text-lg sm:text-xl font-black font-outfit text-gray-900 dark:text-white">Calendario Interactivo de Jornadas</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Haz clic en cualquier fecha destacada para filtrar los partidos de esa jornada.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {selectedDateFilter && (
                        <button
                            onClick={() => onSelectDate('')}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-extrabold hover:bg-amber-200 transition-all flex items-center shadow-xs"
                        >
                            ✕ Ver Todas ({selectedDateFilter})
                        </button>
                    )}
                    <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600">
                        <button onClick={prevMonth} className="px-2.5 py-1 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all" title="Mes Anterior">←</button>
                        <span className="text-sm sm:text-base font-black px-2 font-outfit min-w-[130px] text-center text-[#101097] dark:text-blue-300">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button onClick={nextMonth} className="px-2.5 py-1 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all" title="Siguiente Mes">→</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center font-black text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-300 py-1">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span className="text-[#101097] dark:text-blue-400 font-black">Vie</span><span>Sáb</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {daysGrid.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="h-11 sm:h-13 rounded-xl bg-gray-50/40 dark:bg-gray-900/10"></div>;
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
                        bgStyle = 'bg-[#101097] text-white shadow-lg ring-4 ring-amber-400 font-black z-10 scale-105';
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
                            className={`h-11 sm:h-13 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-150 p-1 ${
                                hasMatches
                                    ? `${bgStyle} shadow-md hover:scale-105 hover:shadow-lg font-black cursor-pointer`
                                    : isCTE
                                        ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-black border border-rose-300 dark:border-rose-700 cursor-default'
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
                            <span className="text-xs sm:text-base font-black leading-none flex items-center justify-center">
                                {hasMatches && dateTag && <span className="text-[11px] mr-0.5">{dateTag}</span>}
                                {day}
                            </span>
                            {hasMatches ? (
                                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full mt-0.5 font-black leading-tight ${badgeStyle}`}>
                                    {matchCount} <span className="hidden sm:inline">{matchCount === 1 ? 'partido' : 'partidos'}</span><span className="sm:hidden">p.</span>
                                </span>
                            ) : isCTE ? (
                                <span className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded-md bg-rose-600 text-white font-black mt-0.5 leading-none shadow-xs">
                                    🚫 CTE
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 pt-3 border-t dark:border-gray-700 gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span> 🤝 Amistoso</span>
                    <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block shadow-xs"></span> 🎉 Inauguración</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#101097] dark:text-blue-400"><span className="w-3 h-3 rounded-full bg-[#101097] inline-block shadow-xs"></span> 🏆 Oficial</span>
                    <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span> 🚫 CTE / Vacaciones</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveCalendar;
