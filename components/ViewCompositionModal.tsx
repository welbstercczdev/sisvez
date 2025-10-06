import React, { useState, useEffect } from 'react';
import { XIcon, ChevronDownIcon, PersonIcon } from './icons/IconComponents';
import { Equipe } from '../types';

interface ViewCompositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipes: Equipe[];
}

const ViewCompositionModal: React.FC<ViewCompositionModalProps> = ({ isOpen, onClose, equipes }) => {
    const [openTeamId, setOpenTeamId] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const toggleTeam = (id: string) => {
        setOpenTeamId(openTeamId === id ? null : id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Formação das Equipes</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-3">
                        {equipes.length > 0 ? (
                            equipes.map(equipe => (
                                <div key={equipe.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => toggleTeam(equipe.id)} 
                                        className="w-full flex justify-between items-center p-4 text-left bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                        aria-expanded={openTeamId === equipe.id}
                                    >
                                        <div>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{equipe.nome}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Líder: {equipe.lider.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                equipe.status === 'Ativo' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {equipe.status}
                                            </span>
                                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${openTeamId === equipe.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openTeamId === equipe.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                                <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Membros ({equipe.membros.length})</h5>
                                                <ul className="space-y-2">
                                                    {equipe.membros.map(membro => (
                                                        <li key={membro.id} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                            <PersonIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                            <span>{membro.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhuma equipe foi cadastrada ainda.</p>
                        )}
                    </div>
                </div>
                 <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
                    >
                        Fechar
                    </button>
                </div>
            </div>
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

export default ViewCompositionModal;
