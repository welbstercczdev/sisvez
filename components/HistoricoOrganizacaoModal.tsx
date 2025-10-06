import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, ChevronDownIcon, CalendarIcon } from './icons/IconComponents';
import { OrganizacaoSalva, Funcao } from '../types';

const FUNCAO_COLORS: Record<Funcao, { bg: string; text: string; dot: string; border?: string }> = {
    'Aplicador': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200', dot: 'bg-sky-500', border: 'border border-transparent' },
    'Anotador': { bg: 'bg-amber-100 dark:bg-amber-900/70', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500', border: 'border border-transparent' },
    'Facilitador': { bg: 'bg-emerald-100 dark:bg-emerald-900/70', text: 'text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500', border: 'border border-transparent' },
    'Motorista': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500', border: 'border border-transparent' },
    'Operador': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/70', text: 'text-fuchsia-800 dark:text-fuchsia-200', dot: 'bg-fuchsia-500', border: 'border border-transparent' },
};

interface HistoricoOrganizacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    historico: OrganizacaoSalva[];
}

const HistoricoOrganizacaoModal: React.FC<HistoricoOrganizacaoModalProps> = ({ isOpen, onClose, historico }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [openEntries, setOpenEntries] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const filteredAndGroupedData = useMemo(() => {
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        const filtered = historico.filter(item => {
            const itemDate = new Date(item.data + 'T00:00:00');
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;
            return true;
        });

        const groupedByDate = filtered.reduce((acc, item) => {
            (acc[item.data] = acc[item.data] || []).push(item);
            return acc;
        }, {} as Record<string, OrganizacaoSalva[]>);

        return Object.entries(groupedByDate).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [historico, startDate, endDate]);

    const toggleEntry = (id: string) => {
        setOpenEntries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Histórico de Organizações de Equipe</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/30">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <label htmlFor="startDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">De:</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Até:</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                    </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-3">
                        {filteredAndGroupedData.length > 0 ? (
                            filteredAndGroupedData.map(([date, organizations]) => {
                                const dateId = `date-${date}`;
                                const isDateOpen = openEntries.has(dateId);
                                return (
                                    <div key={date} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <button onClick={() => toggleEntry(dateId)} className="w-full flex justify-between items-center p-4 text-left bg-slate-100/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </h4>
                                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-in-out ${isDateOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                                    {organizations.map(org => {
                                                        const teamId = `team-${org.id}`;
                                                        const isTeamOpen = openEntries.has(teamId);
                                                        return (
                                                            <div key={org.id} className="border border-slate-200 dark:border-slate-600 rounded-md overflow-hidden">
                                                                <button onClick={() => toggleEntry(teamId)} className="w-full flex justify-between items-center p-3 text-left bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/80">
                                                                    <div>
                                                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{org.equipe.nome}</p>
                                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Salvo por {org.usuarioSalvo.name} em {new Date(org.dataSalvamento).toLocaleString('pt-BR')}</p>
                                                                    </div>
                                                                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isTeamOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                <div className={`grid transition-all duration-300 ease-in-out ${isTeamOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                                     <div className="overflow-hidden">
                                                                        <div className="p-3 border-t border-slate-200 dark:border-slate-600 space-y-2">
                                                                            {org.grupos.length > 0 ? org.grupos.map(group => (
                                                                                <div key={group.id} className="pb-2">
                                                                                    <h5 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-1">{group.nome}</h5>
                                                                                    <ul className="space-y-1 pl-2">
                                                                                        {group.membros.map(member => (
                                                                                            <li key={member.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                                                <span>- {member.name}</span>
                                                                                                <div className="flex flex-wrap gap-1">
                                                                                                    {member.funcoes.map(funcao => (
                                                                                                        <span key={funcao} className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${FUNCAO_COLORS[funcao].bg} ${FUNCAO_COLORS[funcao].text}`}>
                                                                                                            {funcao}
                                                                                                        </span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )) : <p className="text-sm italic text-slate-500 dark:text-slate-400">Nenhum grupo formado (equipe não saiu a campo).</p>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-12">Nenhum registro de organização encontrado para o período selecionado.</p>
                        )}
                    </div>
                </div>
                 <div className="flex-shrink-0 flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                        Fechar
                    </button>
                </div>
            </div>
            <style>{`.animate-scale-in{animation:scale-in .2s ease-out forwards}@keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        </div>
    );
};

export default HistoricoOrganizacaoModal;