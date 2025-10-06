import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/IconComponents';
import { Equipe, User } from '../types';
import MultiSelect from './MultiSelect';

interface InserirEquipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Equipe) => void;
}

const DUMMY_USERS: User[] = [
    { id: 1, name: 'Ana Silva' },
    { id: 2, name: 'Bruno Costa' },
    { id: 3, name: 'Carla Dias' },
    { id: 4, name: 'Daniel Farias' },
    { id: 5, name: 'Elisa Gomes' },
    { id: 6, name: 'Fábio Lima' },
    { id: 7, name: 'Mariana Oliveira' },
    { id: 8, name: 'Pedro Martins' }
];

const InserirEquipeModal: React.FC<InserirEquipeModalProps> = ({ isOpen, onClose, onSave }) => {
    const [nome, setNome] = useState('');
    const [lider, setLider] = useState<User | null>(null);
    const [membros, setMembros] = useState<User[]>([]);
    const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              handleClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim()) {
            setError('O nome da equipe é obrigatório.');
            return;
        }
        if (!lider) {
            setError('Selecione um líder.');
            return;
        }
        if (membros.length === 0) {
            setError('A equipe deve ter pelo menos um membro.');
            return;
        }

        const novaEquipe: Equipe = {
            id: `EQ-${Date.now()}`,
            nome,
            lider,
            membros,
            status,
        };
        onSave(novaEquipe);
        handleClose();
    };
    
    const handleClose = () => {
        setNome('');
        setLider(null);
        setMembros([]);
        setStatus('Ativo');
        setError(null);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Inserir Nova Equipe</h2>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="nome_equipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Equipe</label>
                            <input type="text" id="nome_equipe" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Ex: Equipe de Campo - Setor 1" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="lider" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Líder</label>
                            <select id="lider" value={lider?.id || ''} onChange={(e) => setLider(DUMMY_USERS.find(u => u.id === parseInt(e.target.value)) || null)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                                <option value="">-- Selecione um Líder --</option>
                                {DUMMY_USERS.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membros</label>
                             <MultiSelect
                                options={DUMMY_USERS}
                                selectedValues={membros}
                                onChange={setMembros}
                                placeholder="Selecione os membros..."
                             />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                             <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" value="Ativo" checked={status === 'Ativo'} onChange={(e) => setStatus(e.target.value as any)} className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Ativo</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" value="Inativo" checked={status === 'Inativo'} onChange={(e) => setStatus(e.target.value as any)} className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Inativo</span>
                                </label>
                             </div>
                        </div>

                        {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
                   </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl space-x-3">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Cancelar
                    </button>
                     <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                    >
                        Salvar Equipe
                    </button>
                </div>
            </form>
            {/* Simple animation for modal entrance */}
            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default InserirEquipeModal;