import React, { useState } from 'react';

interface InserirUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    // A função onSave agora espera um objeto com id e name
    onSave: (data: { id: string, name: string }) => void;
}

const InserirUsuarioModal: React.FC<InserirUsuarioModalProps> = ({ isOpen, onClose, onSave }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');

    const handleSave = () => {
        if (id.trim() && name.trim()) {
            onSave({ id: id.trim(), name: name.trim() });
            setId('');
            setName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Adicionar Novo Usuário</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Matrícula / ID
                        </label>
                        <input
                            id="userId"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Ex: 711500/1"
                        />
                    </div>
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Nome Completo
                        </label>
                        <input
                            id="userName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!id.trim() || !name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InserirUsuarioModal;