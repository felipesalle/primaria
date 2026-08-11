import React from 'react';

export const Modal = ({ show, message, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-4 border-[#101097]">
                <p className="text-gray-800 dark:text-white text-lg mb-6">{message}</p>
                <button onClick={onClose} className="btn-primary w-full">Aceptar</button>
            </div>
        </div>
    );
};

export default Modal;
