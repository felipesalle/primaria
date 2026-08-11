import React from 'react';
import { SPORTS_HERO_PRESETS } from '../config/constants';

export const SportsHeroBanner = ({ sport = 'Fútbol', totalTeams = 0, totalMatches = 0, playedMatches = 0 }) => {
    const preset = SPORTS_HERO_PRESETS[sport] || SPORTS_HERO_PRESETS['Fútbol'];

    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-6 border border-white/20">
            <div 
                className="absolute inset-0 bg-cover bg-center filter brightness-50 scale-105 transition-transform duration-700 hover:scale-100" 
                style={{ backgroundImage: `url(${preset.bannerImg})` }}
            />
            <div className={`relative z-10 p-6 sm:p-8 bg-gradient-to-r ${preset.colorTheme} mix-blend-multiply opacity-90`} />
            <div className="absolute inset-0 z-20 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white gap-4">
                <div className="space-y-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
                        {preset.badge}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit tracking-tight drop-shadow-md">
                        {preset.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-lg drop-shadow">
                        {preset.subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg self-stretch sm:self-auto justify-around sm:justify-start">
                    <div className="text-center px-2">
                        <span className="block text-xl sm:text-2xl font-black text-amber-400 font-outfit">{totalTeams}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Equipos</span>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center px-2">
                        <span className="block text-xl sm:text-2xl font-black text-blue-400 font-outfit">{playedMatches} / {totalMatches}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Jugados</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SportsHeroBanner;
