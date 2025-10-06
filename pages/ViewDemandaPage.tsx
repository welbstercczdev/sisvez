import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HomeIcon, CalendarIcon, MapPinIcon, ChevronDownIcon, MapIcon, PlusIcon, XIcon, PersonIcon, CheckCircleFillIcon } from '../components/icons/IconComponents';
import { Demanda, Funcao, Grupo } from '../types';
import QuadrasMapModal from '../components/QuadrasMapModal';
import QuadraSelectionList from '../components/QuadraSelectionList';
import FecharQuadraModal from '../components/FecharQuadraModal';

interface ViewDemandaPageProps {
    onNavigate: (page: string) => void;
    demanda: Demanda | null;
    gruposDoDia: Grupo[] | null;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

// Custom Dropdown Component for Status
interface StatusDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { [key: string]: { text: string; color: string } };
}

const FUNCAO_COLORS: Record<Funcao, { bg: string; text: string; }> = {
    'Aplicador': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200' },
    'Anotador': { bg: 'bg-amber-100 dark:bg-amber-900/70', text: 'text-amber-800 dark:text-amber-200' },
    'Facilitador': { bg: 'bg-emerald-100 dark:bg-emerald-900/70', text: 'text-emerald-800 dark:text-emerald-200' },
    'Motorista': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200' },
    'Operador': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/70', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options[value] || Object.values(options)[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${selectedOption.color}`}></span>
                    {selectedOption.text}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto" role="listbox">
                    {Object.keys(options).map((key) => (
                        <li
                            key={key}
                            onClick={() => {
                                onChange(key);
                                setIsOpen(false);
                            }}
                            className={`p-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer flex items-center ${value === key ? 'bg-slate-100 dark:bg-slate-600' : ''}`}
                            role="option"
                            aria-selected={value === key}
                        >
                            <span className={`w-3 h-3 rounded-full mr-2 ${options[key].color}`}></span>
                            {options[key].text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const AssignQuadrasDropdown: React.FC<{
    groupId: string;
    allQuadras: string[];
    allAssignedQuadras: Set<string>;
    assignedToThisGroup: Set<string>;
    onAssign: (groupId: string, quadras: string[]) => void;
}> = ({ groupId, allQuadras, allAssignedQuadras, assignedToThisGroup, onAssign }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleQuadra = (quadra: string) => {
        if (assignedToThisGroup.has(quadra)) return;
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(quadra)) newSet.delete(quadra);
            else newSet.add(quadra);
            return newSet;
        });
    };

    const handleConfirm = () => {
        onAssign(groupId, Array.from(selected));
        setSelected(new Set());
        setIsOpen(false);
    };

    const allAvailableAssignedToThisGroup = allQuadras.every(q => assignedToThisGroup.has(q));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={allAvailableAssignedToThisGroup}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200 dark:hover:bg-sky-900/70 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-4 h-4" /> Adicionar Quadras
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-1 w-64 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg right-0">
                    <div className="p-2 max-h-48 overflow-y-auto">
                        {allQuadras.length > 0 ? allQuadras.map(quadra => {
                            const isAssignedToAny = allAssignedQuadras.has(quadra);
                            const isAssignedToCurrent = assignedToThisGroup.has(quadra);
                            
                            return (
                                <label key={quadra} className={`flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600 ${isAssignedToCurrent ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(quadra) || isAssignedToCurrent}
                                        disabled={isAssignedToCurrent}
                                        onChange={() => handleToggleQuadra(quadra)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className={`text-sm flex items-center gap-2 ${isAssignedToAny && !isAssignedToCurrent ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {isAssignedToAny && !isAssignedToCurrent && <div className="w-2 h-2 rounded-full bg-sky-500" title="Atribuída a outro grupo"></div>}
                                        {quadra}
                                    </span>
                                </label>
                            );
                        }) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 p-2 italic">Nenhuma quadra para distribuir.</p>
                        )}
                    </div>
                     <div className="p-2 border-t border-slate-200 dark:border-slate-600 flex justify-end">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selected.size === 0}
                            className="px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                        >
                            Confirmar ({selected.size})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const ViewDemandaPage: React.FC<ViewDemandaPageProps> = ({ onNavigate, demanda, gruposDoDia }) => {
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        diaNeb: '',
        equipe: '',
        numeroNeb: '',
        relacaoQuadras: '7-128, 7-129, 7-130, 7-131, 7-145, 7-147, 7-148, 7-149',
        dataTermino: '',
        status: 'Programado'
    });

    interface QuadraFechamento {
        trabalhado: number;
        fechado: number;
        desabitado: number;
        recusado: number;
    }

    const [quadraFechamentoData, setQuadraFechamentoData] = useState<Map<string, QuadraFechamento>>(new Map());
    const [quadraParaFechar, setQuadraParaFechar] = useState<string | null>(null);
    const [isFecharQuadraModalOpen, setIsFecharQuadraModalOpen] = useState(false);
    const [quadraDistribution, setQuadraDistribution] = useState<Map<string, Set<string>>>(new Map());
    const [bairro, setBairro] = useState('VILA INDUSTRIAL');

    const totaisFechamento = useMemo(() => {
        const totais = { trabalhado: 0, fechado: 0, desabitado: 0, recusado: 0 };
        quadraFechamentoData.forEach(data => {
            totais.trabalhado += data.trabalhado;
            totais.fechado += data.fechado;
            totais.desabitado += data.desabitado;
            totais.recusado += data.recusado;
        });
        return totais;
    }, [quadraFechamentoData]);

    const totalVisitados = totaisFechamento.trabalhado + totaisFechamento.fechado + totaisFechamento.recusado + totaisFechamento.desabitado;
    const pendencia = totalVisitados > 0 
        ? (((totaisFechamento.fechado + totaisFechamento.recusado + totaisFechamento.desabitado) / totalVisitados) * 100).toFixed(2).replace('.', ',') + '%'
        : '0,00%';

    useEffect(() => {
        if(demanda) {
            let formStatus = 'Programado';
            if (demanda.status === 'Em Andamento') formStatus = 'Iniciado';
            if (demanda.status === 'Concluído') formStatus = 'Concluído';

             // Simple parse for bairro from address string
            const addressParts = demanda.endereco.split('-');
            if (addressParts.length > 1) {
                setBairro(addressParts[1].split(',')[0].trim().toUpperCase());
            }

            setFormData(prev => ({
                ...prev,
                status: formStatus,
                equipe: demanda.responsavel.name,
                numeroNeb: demanda.id.replace('NEB-', '').replace('CC-',''),
                diaNeb: demanda.prazo,
            }));
        }
    }, [demanda, gruposDoDia]);

    const allQuadras = useMemo(() =>
        formData.relacaoQuadras.split(',').map(s => s.trim()).filter(Boolean),
        [formData.relacaoQuadras]
    );
    const totalQuadras = allQuadras.length;

    const allAssignedQuadras = useMemo(() => {
        const assigned = new Set<string>();
        quadraDistribution.forEach(quadras => {
            quadras.forEach(q => assigned.add(q));
        });
        return assigned;
    }, [quadraDistribution]);

    const assignedQuadrasCount = allAssignedQuadras.size;

    const unassignedQuadrasCount = allQuadras.length - assignedQuadrasCount;

    const handleAssignQuadras = (groupId: string, quadrasToAdd: string[]) => {
        setQuadraDistribution(prev => {
            const newDist = new Map(prev);
            const currentSet = new Set(newDist.get(groupId) || []);
            quadrasToAdd.forEach(q => currentSet.add(q));
            newDist.set(groupId, currentSet);
            return newDist;
        });
    };

    const handleUnassignQuadra = (groupId: string, quadraToRemove: string) => {
        setQuadraDistribution(prevDist => {
            const newDist = new Map(prevDist);
            const currentSet = newDist.get(groupId);
            
            if (currentSet) {
                const newSet = new Set(currentSet);
                newSet.delete(quadraToRemove);
                if (newSet.size === 0) {
                    newDist.delete(groupId);
                } else {
                    newDist.set(groupId, newSet);
                }
            }

            // After updating the distribution, check if the quadra is still assigned anywhere.
            let isStillAssigned = false;
            for (const assignedQuadras of newDist.values()) {
                if (assignedQuadras.has(quadraToRemove)) {
                    isStillAssigned = true;
                    break;
                }
            }

            // If it's no longer assigned to any group, remove its closing data.
            if (!isStillAssigned) {
                setQuadraFechamentoData(prevFechamento => {
                    const newFechamento = new Map(prevFechamento);
                    if (newFechamento.has(quadraToRemove)) {
                        newFechamento.delete(quadraToRemove);
                        return newFechamento;
                    }
                    return prevFechamento; // No change if it wasn't there
                });
            }

            return newDist;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuadrasSave = (quadras: string) => {
        setFormData(prev => ({ ...prev, relacaoQuadras: quadras }));
    };

    const handleOpenFecharModal = (quadraId: string) => {
        setQuadraParaFechar(quadraId);
        setIsFecharQuadraModalOpen(true);
    };

    const handleCloseFecharModal = () => {
        setQuadraParaFechar(null);
        setIsFecharQuadraModalOpen(false);
    };

    const handleSaveFechamento = (quadraId: string, data: QuadraFechamento) => { setQuadraFechamentoData(prev => new Map(prev).set(quadraId, data)); handleCloseFecharModal(); };

    const statusOptions = {
        'Programado': { text: 'Programado', color: 'bg-red-500' },
        'Iniciado': { text: 'Iniciado', color: 'bg-yellow-500' },
        'Concluído (fechamento pendente)': { text: 'Concluído (fechamento pendente)', color: 'bg-blue-500' },
        'Concluído': { text: 'Concluído', color: 'bg-green-500' },
    };

    if (!demanda) {
        return (
             <section className="space-y-6 pb-8">
                <div>
                    <nav className="flex items-center text-sm" aria-label="Breadcrumb"><ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">...</ol></nav>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <p className="text-center text-slate-500 dark:text-slate-400">Nenhuma demanda selecionada. Por favor, volte e selecione uma demanda.</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="space-y-6 pb-8">
                {/* Breadcrumbs */}
                <div>
                    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                            <li className="inline-flex items-center">
                                <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200">
                                    <HomeIcon className="w-4 h-4 me-2.5" />
                                    Arboviroses
                                </button>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                                    <button onClick={() => onNavigate('demandas_lider')} className="ms-1 font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200 md:ms-2">Demandas do Líder</button>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/></svg>
                                    <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Detalhes da Demanda</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
                
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Dados da atividade salvos!'); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <FormField label="Número da notificação"><input type="text" value={demanda.notificacaoOrigem} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            
                            {demanda.tipo === 'Nebulização' && (
                                <>
                                    <FormField label="Dia da NEB">
                                        <div className="relative">
                                            <input type="date" name="diaNeb" value={formData.diaNeb} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-sm" />
                                            <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </FormField>
                                    <FormField label="Equipe Neb"><input type="text" name="equipe" value={formData.equipe} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                                </>
                            )}
                            
                            <FormField label="Agravo"><input type="text" value="Dengue" disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            
                            {demanda.tipo === 'Controle de Criadouro' && (
                                <>
                                    <FormField label="Data CC"><input type="date" value={demanda.dataCriacao} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-sm" /></FormField>
                                    <FormField label="Equipe CC"><input type="text" defaultValue="LUCIMARA" disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                                </>
                            )}

                            <div className="md:col-span-2 lg:col-span-3">
                                <FormField label="Endereço">
                                    <div className="relative">
                                        <input type="text" value={demanda.endereco} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm pr-10" />
                                        <MapPinIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </FormField>
                            </div>
                            
                            {demanda.tipo === 'Nebulização' && (
                                <FormField label="Número da Neb"><input type="text" name="numeroNeb" value={formData.numeroNeb} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            )}

                            <FormField label="Área"><input type="text" defaultValue="7" disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <div className="md:col-span-2 lg:col-span-1"><FormField label="Bairro"><input type="text" value={bairro} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField></div>
                            <FormField label="Total de quadras">
                                <input type="text"
                                    value={totalQuadras}
                                    disabled
                                    className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium"
                                />
                            </FormField>
                            <div className="md:col-span-2 lg:col-span-3">
                               <QuadraSelectionList
                                    label="Relação de quadras"
                                    value={formData.relacaoQuadras}
                                    onChange={handleQuadrasSave}
                                    areaId="7"
                                />
                            </div>
                            
                            <FormField label="Total de grupos">
                                {gruposDoDia ? (
                                    <input 
                                        type="text" 
                                        value={gruposDoDia.length} 
                                        disabled 
                                        className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium" 
                                    />
                                ) : (
                                    <input type="text" value={0} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-center font-medium" />
                                )}
                            </FormField>

                            {gruposDoDia && gruposDoDia.length > 0 && (
                                <div className="md:col-span-2 lg:col-span-3">
                                    <FormField label="Grupos do Dia e Distribuição de Quadras">
                                        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                <strong>Resumo:</strong> {assignedQuadrasCount} de {allQuadras.length} quadras distribuídas.
                                                <span className={unassignedQuadrasCount > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-green-600 dark:text-green-400 font-semibold'}>
                                                    {unassignedQuadrasCount > 0 ? ` Faltam ${unassignedQuadrasCount}.` : ' Todas distribuídas!'}
                                                </span>
                                            </p>
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                {gruposDoDia.map(group => {
                                                    const assignedToThisGroup = quadraDistribution.get(group.id) || new Set();
                                                    
                                                    return (
                                                    <div key={group.id} className="p-3 bg-white dark:bg-slate-800/80 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{group.nome}</p>
                                                            <AssignQuadrasDropdown
                                                                groupId={group.id}
                                                                allQuadras={allQuadras}
                                                                allAssignedQuadras={allAssignedQuadras}
                                                                assignedToThisGroup={assignedToThisGroup}
                                                                onAssign={handleAssignQuadras}
                                                            />
                                                        </div>
                                                        <ul className="pl-1 mb-3 text-xs text-slate-600 dark:text-slate-400">
                                                            {group.membros.map(member => (
                                                                <li key={member.id} className="flex items-center gap-2 mt-1">
                                                                    <PersonIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                                    <span className="flex-grow">{member.name}</span>
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
                                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                                            <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                                                                {quadraDistribution.has(group.id) && Array.from(quadraDistribution.get(group.id)!).sort().map(quadra => {
                                                                    const isFechada = quadraFechamentoData.has(quadra);
                                                                    return (
                                                                        <div key={quadra} className="relative group">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => (demanda.tipo === 'Nebulização' || demanda.tipo === 'Controle de Criadouro') && handleOpenFecharModal(quadra)}
                                                                                className={`flex items-center gap-1.5 text-xs font-medium pl-2 pr-1 py-0.5 rounded-full transition-colors duration-200 ${isFechada ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'} ${(demanda.tipo === 'Nebulização' || demanda.tipo === 'Controle de Criadouro') ? 'hover:bg-sky-200 dark:hover:bg-sky-700 cursor-pointer' : 'cursor-default'}`}
                                                                            >
                                                                                {isFechada && <CheckCircleFillIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-300" />}
                                                                                {quadra}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => { e.stopPropagation(); handleUnassignQuadra(group.id, quadra); }}
                                                                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                                                                    aria-label={`Remover quadra ${quadra}`}
                                                                                >
                                                                                    <XIcon className="w-3 h-3" />
                                                                                </button>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {(!quadraDistribution.has(group.id) || quadraDistribution.get(group.id)!.size === 0) && ( <span className="text-xs text-slate-400 dark:text-slate-500 italic px-1">Nenhuma quadra atribuída.</span> )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )})}
                                            </div>
                                        </div>
                                    </FormField>
                                </div>
                            )}
                            
                            <FormField label="Imóveis Trabalhados"><input type="text" value={totaisFechamento.trabalhado} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Imóveis Fechados"><input type="text" value={totaisFechamento.fechado} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Imóveis Desabitados"><input type="text" value={totaisFechamento.desabitado} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Imóveis Recusados"><input type="text" value={totaisFechamento.recusado} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Total de imóveis visitados"><input type="text" value={totalVisitados} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Pendência %"><input type="text" value={pendencia} disabled className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm" /></FormField>
                            <FormField label="Data de término"><input type="date" name="dataTermino" value={formData.dataTermino} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" /></FormField>
                            <FormField label="Status da atividade">
                                <StatusDropdown
                                    value={formData.status}
                                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                    options={statusOptions}
                                />
                            </FormField>
                        </div>
                         <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => onNavigate('demandas_lider')}
                                className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                            >
                                Voltar
                            </button>
                             <button
                                type="submit"
                                className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </section>
            
            <QuadrasMapModal
                isOpen={isMapModalOpen}
                onClose={() => setMapModalOpen(false)}
                initialSelectedQuadras={formData.relacaoQuadras}
                onSave={handleQuadrasSave}
                initialAreaId="7"
            />
            <FecharQuadraModal
                isOpen={isFecharQuadraModalOpen}
                onClose={handleCloseFecharModal}
                onSave={handleSaveFechamento}
                quadraId={quadraParaFechar}
                initialData={quadraParaFechar ? quadraFechamentoData.get(quadraParaFechar) : undefined}
            />
        </>
    );
};

export default ViewDemandaPage;