import React, { useState } from 'react';

export const AddPlayersModal = ({ team, onClose, onAdd, showMessage }) => {
    if (!team) return null;

    const [playerData, setPlayerData] = useState('');

    const handleAdd = () => {
        const lines = playerData.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length === 0) {
            showMessage("Por favor, introduce al menos un jugador.");
            return;
        }
        
        const players = lines.map(line => {
            const parts = line.split(',');
            const name = parts[0]?.trim();
            const group = parts[1]?.trim().toUpperCase();
            if (!name || !group) {
                showMessage(`Línea inválida: "${line}". Asegúrate de usar el formato "Nombre, Grupo".`);
                return null;
            }
            return { name, group };
        }).filter(Boolean);

        if (players.length > 0) {
            onAdd(team.id, players);
            setPlayerData('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full text-left border-t-4 border-[#101097]">
                <h3 className="text-xl font-bold mb-2">Añadir Jugadores a <span className="text-[#101097] dark:text-blue-300">{team.name}</span></h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Escribe un jugador por línea con el formato: <b>Nombre Apellido, Grupo</b>.
                    <br/>
                    Ejemplo: <b>Juan Pérez, 1A</b>
                </p>
                <textarea
                    value={playerData}
                    onChange={(e) => setPlayerData(e.target.value)}
                    rows="10"
                    className="w-full mt-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Juan Pérez, 1A&#10;Maria García, 2B&#10;..."
                />
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="py-2 px-5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">Cancelar</button>
                    <button onClick={handleAdd} className="btn-primary">Añadir Jugadores</button>
                </div>
            </div>
        </div>
    );
};

export default AddPlayersModal;
