import React, { useState } from 'react';
import { PRESET_THEMES } from '../config/constants';

export const EditTeamModal = ({ team, leagueTheme, onClose, onSave, showMessage }) => {
    if (!team) return null;

    const [name, setName] = useState(team.name);
    const [logoUrl, setLogoUrl] = useState(team.logoUrl);

    const currentThemeName = leagueTheme || "Liga MX";
    const presetOptions = PRESET_THEMES[currentThemeName] || PRESET_THEMES["Liga MX"];

    const handleSelectPreset = (presetName) => {
        const found = presetOptions.find(p => p.name === presetName);
        if (found) {
            setName(found.name);
            setLogoUrl(found.logoUrl);
        }
    };

    const handleSave = () => {
        if (!name.trim() || !logoUrl.trim()) {
            showMessage("El nombre y la URL del logo no pueden estar vacíos.");
            return;
        }
        onSave(team.id, name, logoUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full text-left border-t-4 border-[#101097] space-y-4">
                <h3 className="text-xl font-bold">Editar Equipo</h3>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1.5">
                    <label className="block text-xs font-bold text-[#101097] dark:text-blue-300 uppercase tracking-wider">
                        ⚡ Elegir de {currentThemeName}:
                    </label>
                    <select
                        onChange={(e) => handleSelectPreset(e.target.value)}
                        defaultValue=""
                        className="w-full p-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                        <option value="">-- Seleccionar Equipo Predeterminado --</option>
                        {presetOptions.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Equipo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del Logo / Escudo</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className="flex-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                            />
                            {logoUrl && <img src={logoUrl} alt="Preview" className="w-8 h-8 rounded-full shadow-md object-contain bg-white" />}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={onClose} className="py-2 px-5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">Cancelar</button>
                    <button onClick={handleSave} className="btn-primary">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default EditTeamModal;
