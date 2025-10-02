import React, { useState, useMemo } from 'react';
import { HomeIcon, ChevronDownIcon, CalendarIcon, UsersIcon } from '../components/icons/IconComponents';
import { OrganizacaoSalva, Funcao } from '../types';

const FUNCAO_COLORS: Record<Funcao, { bg: string; text: string }> = {
    'Aplicador': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200' },
    'Anotador': { bg: 'bg-amber-100 dark:bg-amber-900/70', text: 'text-amber-800 dark:text-amber-200' },
    'Facilitador': { bg: 'bg-emerald-100 dark:bg-emerald-900/70', text: 'text-emerald-800 dark:text-emerald-200' },
    'Motorista': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200' },
    'Operador': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/70', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
};

interface HistoricoGeralPageProps {
    onNavigate: (page: string) => void;
    historicoOrganizacoes: OrganizacaoSalva[];
}

const HistoricoGeralPage: React.FC<HistoricoGeralPageProps> = ({ onNavigate, historicoOrganizacoes }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [openEntries, setOpenEntries] = useState<Set<string>>(new Set());

    const filteredAndGroupedData = useMemo(() => {
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        const filtered = historicoOrganizacoes.filter(item => {
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
    }, [historicoOrganizacoes, startDate, endDate]);

    const toggleEntry = (id: string) => {
        setOpenEntries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <section className="space-y-6 pb-8">
            {/* Breadcrumbs */}
            <div>
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-sm">
                        <li className="inline-flex items-center">
                            <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                                <HomeIcon className="w-4 h-4 me-2.5" />
                            </button>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Recursos Humanos</span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Histórico de Organizações</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>
            {/* Header and Filters */}
            <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Histórico Geral de Organizações</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visualize as composições de equipes salvas pelos líderes.</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                             <span className="text-slate-500 dark:text-slate-400">-</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm"/>
                        </div>
                        <button onClick={clearFilters} className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500">Limpar</button>
                    </div>
                </div>
            </div>

            {/* History Accordion */}
            <div className="space-y-4">
                {filteredAndGroupedData.length > 0 ? (
                    filteredAndGroupedData.map(([date, organizations]) => {
                        const dateId = `date-${date}`;
                        const isDateOpen = openEntries.has(dateId);
                        return (
                            <div key={date} className="bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                                <button onClick={() => toggleEntry(dateId)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                        {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h4>
                                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
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
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Salvo por {org.usuarioSalvo.name} às {new Date(org.dataSalvamento).toLocaleTimeString('pt-BR')}</p>
                                                            </div>
                                                            <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isTeamOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <div className={`grid transition-all duration-300 ease-in-out ${isTeamOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                            <div className="overflow-hidden">
                                                                <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-3">
                                                                    {org.grupos.length > 0 ? org.grupos.map(group => (
                                                                        <div key={group.id}>
                                                                            <h5 className="font-semibold text-md text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2"><UsersIcon className="w-4 h-4" />{group.nome}</h5>
                                                                            <ul className="space-y-1 pl-6">
                                                                                {group.membros.map(member => (
                                                                                    <li key={member.id} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                                                        <span>{member.name}:</span>
                                                                                        <div className="flex flex-wrap gap-1.5">
                                                                                            {member.funcoes.map(funcao => (
                                                                                                <span key={funcao} className={`px-2 py-0.5 text-xs font-medium rounded-full ${FUNCAO_COLORS[funcao].bg} ${FUNCAO_COLORS[funcao].text}`}>{funcao}</span>
                                                                                            ))}
                                                                                            {member.funcoes.length === 0 && <span className="text-xs italic text-slate-500">Sem função</span>}
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
                    <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                         <p className="text-slate-500 dark:text-slate-400">Nenhum registro de organização encontrado para o período selecionado.</p>
                    </div>
                )}
            </div>

        </section>
    );
};

export default HistoricoGeralPage;