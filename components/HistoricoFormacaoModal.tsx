import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, ChevronDownIcon, CalendarIcon } from './icons/IconComponents';
import { OrganizacaoSalva, Funcao, MembroStatus } from '../types';

const FUNCAO_COLORS: Record<Funcao, { bg: string; text: string; }> = {
    'Aplicador': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200' },
    'Anotador': { bg: 'bg-amber-100 dark:bg-amber-900/70', text: 'text-amber-800 dark:text-amber-200' },
    'Facilitador': { bg: 'bg-emerald-100 dark:bg-emerald-900/70', text: 'text-emerald-800 dark:text-emerald-200' },
    'Motorista': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200' },
    'Operador': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/70', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
};

const STATUS_COLORS: Record<MembroStatus, { bg: string; text: string; }> = {
    'Ativo': { bg: 'bg-green-100 dark:bg-green-900/70', text: 'text-green-800 dark:text-green-200' },
    'Folga': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200' },
    'Férias': { bg: 'bg-orange-100 dark:bg-orange-900/70', text: 'text-orange-800 dark:text-orange-200' },
    'Curso': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200' },
    'GLM': { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-200' },
    'Observação': { bg: 'bg-yellow-100 dark:bg-yellow-900/70', text: 'text-yellow-800 dark:text-yellow-200' },
};


interface HistoricoFormacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    historico: OrganizacaoSalva[];
}

const HistoricoFormacaoModal: React.FC<HistoricoFormacaoModalProps> = ({ isOpen, onClose, historico }) => {
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

        const grouped = filtered.reduce((acc, item) => {
            (acc[item.data] = acc[item.data] || []).push(item);
            return acc;
        }, {} as Record<string, OrganizacaoSalva[]>);

        return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
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
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Histórico de Formações Diárias</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/30">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <label htmlFor="startDateModal" className="text-sm font-medium text-slate-700 dark:text-slate-300">De:</label>
                        <input type="date" id="startDateModal" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="endDateModal" className="text-sm font-medium text-slate-700 dark:text-slate-300">Até:</label>
                        <input type="date" id="endDateModal" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
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
                                        <button onClick={() => toggleEntry(dateId)} className="w-full flex justify-between items-center p-4 text-left bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </h4>
                                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-in-out ${isDateOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                    {organizations.map(org => {
                                                        const absentMembers = org.membrosStatus?.filter(m => m.status !== 'Ativo') || [];
                                                        const unassignedActive = org.membrosStatus?.filter(m => m.status === 'Ativo' && !org.grupos.flatMap(g => g.membros).some(gm => gm.id === m.id)) || [];

                                                        return (
                                                        <div key={org.id} className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600">
                                                            <p className="font-semibold text-slate-700 dark:text-slate-300">{org.equipe.nome}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Salvo por {org.usuarioSalvo.name} às {new Date(org.dataSalvamento).toLocaleTimeString('pt-BR')}</p>
                                                            
                                                            <div className="mt-2 space-y-3">
                                                                {org.grupos.length > 0 && (
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-1">Grupos Formados</h5>
                                                                        <div className="space-y-2">
                                                                            {org.grupos.map(group => (
                                                                                <div key={group.id} className="pl-2 border-l-2 border-slate-200 dark:border-slate-600">
                                                                                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">{group.nome}</p>
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
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {unassignedActive.length > 0 && (
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-1">Presentes (Sem Grupo)</h5>
                                                                        <ul className="space-y-1 pl-4">
                                                                             {unassignedActive.map(member => (
                                                                                 <li key={member.id} className="text-sm text-slate-600 dark:text-slate-400">- {member.name}</li>
                                                                             ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {absentMembers.length > 0 && (
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-1">Ausentes / Outros Status</h5>
                                                                        <ul className="space-y-1 pl-4">
                                                                            {absentMembers.map(member => (
                                                                                 <li key={member.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                                    <span>- {member.name}</span>
                                                                                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[member.status].bg} ${STATUS_COLORS[member.status].text}`}>
                                                                                        {member.status === 'Observação' ? member.observacao || 'Observação' : member.status}
                                                                                    </span>
                                                                                 </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {org.grupos.length === 0 && unassignedActive.length === 0 && absentMembers.length > 0 && <p className="text-sm italic text-slate-500 dark:text-slate-400">Toda a equipe estava ausente.</p>}
                                                                {org.grupos.length === 0 && unassignedActive.length > 0 && <p className="text-sm italic text-slate-500 dark:text-slate-400">Equipe presente mas não saiu a campo (sem grupos).</p>}
                                                            </div>
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-12">Nenhum registro de formação encontrado para o período selecionado.</p>
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

export default HistoricoFormacaoModal;