import React, { useState } from 'react';
import { PRESET_THEMES, GILDAN_COLOR_PALETTE, getShirtColorObj, getTeamShirtColor } from '../config/constants';

export const EditTeamModal = ({ team, leagueTheme, onClose, onSave, showMessage }) => {
    if (!team) return null;

    const [name, setName] = useState(team.name);
    const [logoUrl, setLogoUrl] = useState(team.logoUrl);
    const initialColor = getTeamShirtColor(team);
    const [shirtColorName, setShirtColorName] = useState(initialColor.name);

    const currentThemeName = leagueTheme || "Liga MX";
    const presetOptions = PRESET_THEMES[currentThemeName] || PRESET_THEMES["Liga MX"];

    const handleSelectPreset = (presetName) => {
        const found = presetOptions.find(p => p.name === presetName);
        if (found) {
            setName(found.name);
            setLogoUrl(found.logoUrl);
            if (found.shirtColorName) {
                setShirtColorName(found.shirtColorName);
            }
        }
    };

    const selectedColorObj = getShirtColorObj(shirtColorName);

    const handleSave = () => {
        if (!name.trim() || !logoUrl.trim()) {
            showMessage("El nombre y la URL del logo no pueden estar vacíos.");
            return;
        }
        onSave(team.id, name, logoUrl, selectedColorObj.name, selectedColorObj.hex);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl shadow-2xl max-w-md w-full text-left border-t-4 border-[#101097] space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Editar Equipo</h3>

                <div className="bg-blue-50 dark:bg-slate-700/60 p-3.5 rounded-2xl border border-blue-200 dark:border-slate-600 space-y-1.5">
                    <label className="block text-xs font-black text-[#101097] dark:text-blue-300 uppercase tracking-wider">
                        ⚡ Elegir de {currentThemeName}:
                    </label>
                    <select
                        onChange={(e) => handleSelectPreset(e.target.value)}
                        defaultValue=""
                        className="w-full p-2.5 rounded-xl border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-bold text-gray-900 dark:text-white shadow-xs"
                    >
                        <option value="">-- Seleccionar Equipo Predeterminado --</option>
                        {presetOptions.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Nombre del Equipo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1.5 p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-[#101097]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">URL del Logo / Escudo</label>
                        <div className="flex items-center space-x-2.5 mt-1.5">
                            <input
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-xs font-medium"
                            />
                            {logoUrl && <img src={logoUrl} alt="Preview" className="w-9 h-9 rounded-full shadow-md object-contain bg-white border border-gray-200 dark:border-gray-600" />}
                        </div>
                    </div>

                    <div className="pt-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center justify-between">
                            <span>👕 Color de Playera (Gildan)</span>
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg border shadow-xs" style={{ backgroundColor: selectedColorObj.hex, color: selectedColorObj.isLight ? '#000' : '#fff', borderColor: selectedColorObj.border }}>
                                {selectedColorObj.name}
                            </span>
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full shadow-md border-2 border-gray-300 dark:border-gray-500 shrink-0 flex items-center justify-center text-xs font-black" style={{ backgroundColor: selectedColorObj.hex, color: selectedColorObj.isLight ? '#000' : '#fff' }}>
                                👕
                            </span>
                            <select
                                value={shirtColorName}
                                onChange={(e) => setShirtColorName(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-extrabold focus:ring-2 focus:ring-[#101097]"
                            >
                                {GILDAN_COLOR_PALETTE.map(c => (
                                    <option key={c.name} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2.5 px-5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-xs hover:bg-gray-300 dark:hover:bg-slate-600 transition-all text-sm">Cancelar</button>
                    <button onClick={handleSave} className="btn-primary py-2.5 px-6 font-black rounded-xl text-sm shadow-md">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditTeamModal;
