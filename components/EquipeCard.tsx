import React, { useState } from 'react';
import { Equipe } from '../types';
import { PersonIcon, UsersIcon, PencilIcon, TrashIcon, ChevronDownIcon, ClockHistoryIcon } from './icons/IconComponents';

interface EquipeCardProps {
    equipe: Equipe;
    onEdit: (equipe: Equipe) => void;
    onDelete: (equipe: Equipe) => void;
    onHistory: (equipe: Equipe) => void;
}

const EquipeCard: React.FC<EquipeCardProps> = ({ equipe, onEdit, onDelete, onHistory }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusStyles = {
        Ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Inativo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col h-full">
            <div className="p-4 flex justify-between items-start">
                <div className="flex-grow pr-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{equipe.nome}</h3>
                    {/* ====================== MODIFICAÇÃO DO LÍDER ====================== */}
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                        <PersonIcon className="w-4 h-4" />
                        <div>
                            <span>Líder: {equipe.lider.name}</span>
                            <span className="font-mono text-xs ml-2 text-slate-400 dark:text-slate-500">({equipe.lider.id})</span>
                        </div>
                    </div>
                    {/* ==================================================================== */}
                </div>
                <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[equipe.status]}`}>
                        {equipe.status}
                    </span>
                </div>
            </div>
            <div className="px-4 pb-4">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="w-full flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors py-1"
                    aria-expanded={isExpanded}
                >
                    <span className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5"/>
                        Membros ({equipe.membros.length})
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] pt-2' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        {/* ====================== MODIFICAÇÃO DOS MEMBROS ====================== */}
                        <ul className="space-y-2 pl-7 text-sm text-slate-500 dark:text-slate-400 max-h-32 overflow-y-auto">
                            {equipe.membros.map(membro => (
                                <li key={membro.uuid}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-slate-700 dark:text-slate-300">{membro.name}</span>
                                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{membro.id}</span>
                                    </div>
                                </li>
                            ))}
                            {equipe.membros.length === 0 && <li className="italic">Nenhum membro na equipe.</li>}
                        </ul>
                        {/* ======================================================================= */}
                    </div>
                </div>
            </div>
            <div className="flex-grow"></div> {/* Pushes footer to the bottom */}
            <div className="p-2 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button onClick={() => onHistory(equipe)} className="p-1.5 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors" title="Histórico da Equipe">
                    <ClockHistoryIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onEdit(equipe)} className="p-1.5 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors" title="Editar Equipe">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(equipe)} className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Excluir Equipe">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default EquipeCard;