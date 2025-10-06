import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HomeIcon, PlusIcon, UsersIcon, PersonIcon, XIcon, SaveIcon, ChevronDownIcon, ClockHistoryIcon } from '../components/icons/IconComponents';
import { Equipe, User, Grupo, MembroComFuncao, Funcao, MembroComStatus, MembroStatus, OrganizacaoSalva } from '../types';
import HistoricoOrganizacaoModal from '../components/HistoricoOrganizacaoModal';

const FUNCOES: Funcao[] = ['Aplicador', 'Anotador', 'Facilitador', 'Motorista', 'Operador'];

const FUNCAO_COLORS: Record<Funcao, { bg: string; text: string; dot: string; border?: string }> = {
    'Aplicador': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200', dot: 'bg-sky-500', border: 'border border-transparent' },
    'Anotador': { bg: 'bg-amber-100 dark:bg-amber-900/70', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500', border: 'border border-transparent' },
    'Facilitador': { bg: 'bg-emerald-100 dark:bg-emerald-900/70', text: 'text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500', border: 'border border-transparent' },
    'Motorista': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500', border: 'border border-transparent' },
    'Operador': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/70', text: 'text-fuchsia-800 dark:text-fuchsia-200', dot: 'bg-fuchsia-500', border: 'border border-transparent' },
};

const STATUSES: MembroStatus[] = ['Ativo', 'Folga', 'Férias', 'Curso', 'GLM', 'Observação'];

const STATUS_COLORS: Record<MembroStatus, { bg: string; text: string; dot: string; }> = {
    'Ativo': { bg: 'bg-green-100 dark:bg-green-900/70', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
    'Folga': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200', dot: 'bg-sky-500' },
    'Férias': { bg: 'bg-orange-100 dark:bg-orange-900/70', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-500' },
    'Curso': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
    'GLM': { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-200', dot: 'bg-slate-500' },
    'Observação': { bg: 'bg-yellow-100 dark:bg-yellow-900/70', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
};

interface OrganizarEquipesPageProps {
    onNavigate: (page: string) => void;
    currentDate: string;
    setCurrentDate: (date: string) => void;
    dailyStatuses: Map<number, MembroComStatus>;
    onStatusUpdate: (memberId: number, status: MembroStatus, observacao?: string) => void;
    equipes: Equipe[];
    dailyGroups: Map<string, Grupo[]>;
    onGroupsUpdate: (teamId: string, groups: Grupo[]) => void;
    historicoOrganizacoes: OrganizacaoSalva[];
    onHistoricoUpdate: React.Dispatch<React.SetStateAction<OrganizacaoSalva[]>>;
}

const updateGroupName = (group: Grupo, allGroups: Grupo[]): Grupo => {
    const name = group.nome.trim();
    const isDefaultName = /^(Grupo|Dupla|Trio|Quarteto|Quinteto|Solo) \d+$/.test(name);
    if (!isDefaultName) return group;
    const prefixMap: { [key: number]: string } = { 1: "Solo", 2: "Dupla", 3: "Trio", 4: "Quarteto", 5: "Quinteto" };
    const newPrefix = prefixMap[group.membros.length] || "Grupo";
    const groupsWithSamePrefix = allGroups.filter(g => g.id !== group.id && g.nome.startsWith(newPrefix + ' '));
    const existingNumbers = new Set(groupsWithSamePrefix.map(g => parseInt(g.nome.replace(newPrefix, '').trim(), 10)));
    const oldPrefix = name.split(' ')[0];
    if (newPrefix === oldPrefix) {
        const oldNumber = parseInt(name.split(' ')[1], 10);
        if (!isNaN(oldNumber) && !existingNumbers.has(oldNumber)) return group;
    }
    let nextNumber = 1;
    while (existingNumbers.has(nextNumber)) nextNumber++;
    return { ...group, nome: `${newPrefix} ${nextNumber}` };
};

const MultiRoleSelector: React.FC<{
    selectedFuncoes: Funcao[];
    onSelectionChange: (funcoes: Funcao[]) => void;
}> = ({ selectedFuncoes, onSelectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (funcao: Funcao) => {
        const newSelection = new Set(selectedFuncoes);
        if (newSelection.has(funcao)) {
            newSelection.delete(funcao);
        } else {
            newSelection.add(funcao);
        }
        onSelectionChange(Array.from(newSelection));
    };

    const displayLabel = selectedFuncoes.length > 0
        ? `${selectedFuncoes.length} funç${selectedFuncoes.length > 1 ? 'ões' : 'ão'}`
        : 'Definir Funções';

    return (
        <div className="relative w-full sm:w-36" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium rounded-md transition-all duration-150 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
            >
                {displayLabel}
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <ul>
                        {FUNCOES.map(funcao => (
                            <li key={funcao} className="flex items-center px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <input
                                    type="checkbox"
                                    id={`${funcao}-${Math.random()}`} // unique id for label association
                                    checked={selectedFuncoes.includes(funcao)}
                                    onChange={() => handleToggle(funcao)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <label
                                    htmlFor={`${funcao}-${Math.random()}`}
                                    className="ml-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    <span className={`w-3 h-3 rounded-full ${FUNCAO_COLORS[funcao].dot}`}></span>
                                    {funcao}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const StatusSelector: React.FC<{
    member: MembroComStatus;
    onStatusChange: (status: MembroStatus, observacao?: string) => void;
    disabled?: boolean;
}> = ({ member, onStatusChange, disabled = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingObs, setIsEditingObs] = useState(false);
    const [obsText, setObsText] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                menuRef.current && !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
                setIsEditingObs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuToggle = () => {
        if (disabled) return;
        if (!isMenuOpen) {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                let top = rect.bottom + 4; // 4px gap below button
                let left = rect.left;

                const menuHeight = 250; 
                const menuWidth = 224;

                if (top + menuHeight > window.innerHeight) {
                    top = rect.top - menuHeight - 4;
                }
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth - 8;
                }

                setMenuPosition({ top, left });
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSelect = (status: MembroStatus) => {
        if (status === 'Observação') {
            setObsText(member.observacao || '');
            setIsEditingObs(true);
        } else {
            onStatusChange(status);
            setIsMenuOpen(false);
        }
    };

    const handleSaveObs = () => {
        onStatusChange('Observação', obsText);
        setIsEditingObs(false);
        setIsMenuOpen(false);
    };

    const colors = STATUS_COLORS[member.status];
    const displayText = member.status === 'Observação' ? (member.observacao || 'Observação') : member.status;

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                title={disabled ? 'Funcionário em Férias' : displayText}
                onClick={handleMenuToggle}
                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 ${disabled ? 'cursor-not-allowed' : 'transition-transform hover:scale-110'}`}
                disabled={disabled}
            >
                <span className={`w-3.5 h-3.5 rounded-full ${colors.dot}`}></span>
            </button>
            {isMenuOpen && !disabled && menuPosition && (
                <div
                    ref={menuRef}
                    className="fixed z-50 w-56 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-xl"
                    style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                >
                    {!isEditingObs ? (
                        <ul>
                            {STATUSES.map(status => (
                                <li key={status}>
                                    <button
                                        onClick={() => handleSelect(status)}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    >
                                        <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status].dot}`}></span>
                                        {status}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 space-y-2">
                            <label htmlFor="obs-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">Observação</label>
                            <input
                                id="obs-input"
                                type="text"
                                value={obsText}
                                onChange={e => setObsText(e.target.value)}
                                className="w-full bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveObs(); }}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setIsEditingObs(false); setIsMenuOpen(false); }}
                                    className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveObs}
                                    className="px-3 py-1 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};


const OrganizarEquipesPage: React.FC<OrganizarEquipesPageProps> = ({ onNavigate, currentDate, setCurrentDate, dailyStatuses, onStatusUpdate, equipes, dailyGroups, onGroupsUpdate, historicoOrganizacoes, onHistoricoUpdate }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('EQ-1');
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    
    const groups = useMemo(() => dailyGroups.get(selectedTeamId) || [], [dailyGroups, selectedTeamId]);
    
    const teamMembers = useMemo(() => {
        const team = equipes.find(e => e.id === selectedTeamId);
        if (!team) return [];
        const allTeamMemberIds = new Set([team.lider.id, ...team.membros.map(m => m.id)]);
        const members: MembroComStatus[] = [];
        allTeamMemberIds.forEach(id => {
            const status = dailyStatuses.get(id);
            if (status) { members.push(status); }
        });
        return members.sort((a,b) => a.name.localeCompare(b.name));
    }, [selectedTeamId, dailyStatuses, equipes]);
    
    const groupedMemberIds = useMemo(() => new Set(groups.flatMap(g => g.membros.map(m => m.id))), [groups]);
    const availableMembers = useMemo(() => teamMembers.filter(m => !groupedMemberIds.has(m.id)), [teamMembers, groupedMemberIds]);
    const assignableMembers = useMemo(() => availableMembers.filter(m => m.status === 'Ativo'), [availableMembers]);

    useEffect(() => {
        const activeEquipes = equipes.filter(e => e.status === 'Ativo');
        if (!activeEquipes.some(e => e.id === selectedTeamId) && activeEquipes.length > 0) {
            setSelectedTeamId(activeEquipes[0].id);
        }
    }, [equipes, selectedTeamId]);

    const handleSaveOrganization = () => {
        const team = equipes.find(e => e.id === selectedTeamId);
        if (!team) {
            alert("Equipe selecionada inválida.");
            return;
        }
        if (groups.length === 0 && availableMembers.filter(m => m.status === 'Ativo').length > 0) {
            if (!window.confirm("Nenhum grupo foi formado. Deseja salvar mesmo assim? (Isso indicará que a equipe não saiu a campo)")) {
                return;
            }
        }
    
        const currentTeamMembersStatus = teamMembers.map(({ id, name, status, observacao }) => ({ id, name, status, observacao }));

        const newRecord: OrganizacaoSalva = {
            id: `ORG-${Date.now()}`,
            data: currentDate,
            dataSalvamento: new Date().toISOString(),
            usuarioSalvo: { id: 99, name: 'WELBSTER' },
            equipe: team,
            grupos: groups,
            membrosStatus: currentTeamMembersStatus,
        };
    
        onHistoricoUpdate(prev => [newRecord, ...prev].sort((a,b) => new Date(b.dataSalvamento).getTime() - new Date(a.dataSalvamento).getTime()));
        alert(`Organização para ${team.nome} em ${new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR')} foi salva com sucesso!`);
    };

    const handleAddGroup = () => {
        const groupsWithGrupoPrefix = groups.filter(g => g.nome.startsWith('Grupo '));
        const existingNumbers = new Set(
            groupsWithGrupoPrefix.map(g => parseInt(g.nome.replace('Grupo ', '').trim(), 10)).filter(n => !isNaN(n))
        );
        let nextGroupNumber = 1;
        while (existingNumbers.has(nextGroupNumber)) nextGroupNumber++;

        const newGroup: Grupo = { id: `group-${Date.now()}`, nome: `Grupo ${nextGroupNumber}`, membros: [] };
        onGroupsUpdate(selectedTeamId, [...groups, newGroup]);
    };
    
    const handleRemoveGroup = (groupId: string) => {
        onGroupsUpdate(selectedTeamId, groups.filter(g => g.id !== groupId));
    };
    
    const handleAssignMember = (groupId: string, memberId: number) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member || member.status !== 'Ativo') return;

        let modifiedGroup: Grupo | undefined;
        const intermediateGroups = groups.map(g => {
            if (g.id === groupId) {
                const { status, observacao, ...user } = member;
                const newMemberWithRole: MembroComFuncao = { ...user, funcoes: [] };
                modifiedGroup = { ...g, membros: [...g.membros, newMemberWithRole].sort((a,b) => a.name.localeCompare(b.name)) };
                return modifiedGroup;
            }
            return g;
        });
        if (modifiedGroup) {
            const finalGroup = updateGroupName(modifiedGroup, intermediateGroups);
            const finalGroups = intermediateGroups.map(g => g.id === groupId ? finalGroup : g);
            onGroupsUpdate(selectedTeamId, finalGroups);
        }
    };

    const handleUnassignMember = (groupId: string, memberId: number) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const updatedGroup = { ...group, membros: group.membros.filter(m => m.id !== memberId) };
        const intermediateGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
        const finalGroup = updateGroupName(updatedGroup, intermediateGroups);
        onGroupsUpdate(selectedTeamId, intermediateGroups.map(g => g.id === groupId ? finalGroup : g));
    };

    const handleGroupNameChange = (groupId: string, newName: string) => {
        onGroupsUpdate(selectedTeamId, groups.map(g => g.id === groupId ? { ...g, nome: newName } : g));
    };
    
    const handleMemberFunctionsChange = (groupId: string, memberId: number, funcoes: Funcao[]) => {
        const newGroups = groups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    membros: group.membros.map(member =>
                        member.id === memberId ? { ...member, funcoes: funcoes.sort() } : member
                    ),
                };
            }
            return group;
        });
        onGroupsUpdate(selectedTeamId, newGroups);
    };

    const activeEquipes = equipes.filter(e => e.status === 'Ativo');

    return (
        <>
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
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Recursos Humanos</span>
                        </div>
                        </li>
                        <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Organizar Equipe</span>
                        </div>
                        </li>
                    </ol>
                  </nav>
                </div>
                {/* Header and Actions */}
                <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Organizar Equipe para {new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecione uma equipe e organize os membros em grupos.</p>
                    </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        >
                            {activeEquipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                        </select>
                         <button onClick={() => setIsHistoricoModalOpen(true)} className="flex items-center justify-center gap-2 w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600">
                            <ClockHistoryIcon className="w-4 h-4" />
                            <span>Histórico</span>
                        </button>
                         <button onClick={handleSaveOrganization} className="flex items-center justify-center gap-2 w-auto px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                            <SaveIcon className="w-4 h-4" />
                            <span>Salvar</span>
                        </button>
                     </div>
                </div>
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Available Members */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                            <UsersIcon className="w-5 h-5" />
                            Membros da Equipe ({teamMembers.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {teamMembers.length > 0 ? availableMembers.map(member => (
                                <div key={member.id} className={`flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-sm transition-opacity ${member.status !== 'Ativo' ? 'opacity-50' : ''} ${member.status === 'Férias' ? 'opacity-60' : ''}`}>
                                    <StatusSelector 
                                        member={member} 
                                        onStatusChange={(status, obs) => onStatusUpdate(member.id, status, obs)}
                                        disabled={member.status === 'Férias'}
                                    />
                                    <span className={`flex-grow text-slate-700 dark:text-slate-300 ${member.status !== 'Ativo' ? 'line-through' : ''} ${member.status === 'Férias' ? 'italic' : ''}`}>{member.name}</span>
                                    {member.status === 'Férias' && <span className="text-xs font-semibold text-orange-500 dark:text-orange-400">Férias</span>}
                                </div>
                            )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhum membro na equipe para esta data.</p>}
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Grupos Formados ({groups.length})</h3>
                            <button onClick={handleAddGroup} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md shadow-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Adicionar Grupo</span>
                            </button>
                        </div>
                        {groups.map(group => (
                            <GrupoCard 
                                key={group.id}
                                group={group}
                                onNameChange={handleGroupNameChange}
                                onAddMember={handleAssignMember}
                                onRemoveMember={handleUnassignMember}
                                onMemberFunctionsChange={handleMemberFunctionsChange}
                                onDeleteGroup={handleRemoveGroup}
                                availableMembersForDropdown={assignableMembers}
                            />
                        ))}
                        {groups.length === 0 && <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50"><p className="text-slate-500 dark:text-slate-400">Nenhum grupo formado. Clique em "Adicionar Grupo" para começar.</p></div>}
                    </div>
                </div>
            </section>
            <HistoricoOrganizacaoModal
                isOpen={isHistoricoModalOpen}
                onClose={() => setIsHistoricoModalOpen(false)}
                historico={historicoOrganizacoes}
            />
        </>
    );
};


interface GrupoCardProps {
    group: Grupo;
    onNameChange: (groupId: string, newName: string) => void;
    onAddMember: (groupId: string, memberId: number) => void;
    onRemoveMember: (groupId: string, memberId: number) => void;
    onMemberFunctionsChange: (groupId: string, memberId: number, funcoes: Funcao[]) => void;
    onDeleteGroup: (groupId: string) => void;
    availableMembersForDropdown: User[];
}

const GrupoCard: React.FC<GrupoCardProps> = ({ group, onNameChange, onAddMember, onRemoveMember, onMemberFunctionsChange, onDeleteGroup, availableMembersForDropdown }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-3">
                <input
                    type="text"
                    value={group.nome}
                    onChange={e => onNameChange(group.id, e.target.value)}
                    className="font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-b-2 border-transparent focus:border-sky-500 focus:outline-none w-full"
                />
                <button onClick={() => onDeleteGroup(group.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1" title="Excluir Grupo">
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
            <div className="space-y-2 mb-4">
                {group.membros.map(member => (
                    <div key={member.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-sm gap-2">
                        <div className="flex-grow flex items-center gap-2 flex-wrap">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{member.name}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {member.funcoes.length > 0 ? (
                                    member.funcoes.map(funcao => (
                                        <span key={funcao} className={`px-2 py-0.5 text-xs font-medium rounded-full ${FUNCAO_COLORS[funcao].bg} ${FUNCAO_COLORS[funcao].text}`}>
                                            {funcao}
                                        </span>
                                    ))
                                ) : (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400`}>
                                        Sem função
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                           <MultiRoleSelector
                                selectedFuncoes={member.funcoes}
                                onSelectionChange={(funcoes) => onMemberFunctionsChange(group.id, member.id, funcoes)}
                           />
                            <button onClick={() => onRemoveMember(group.id, member.id)} className="flex-shrink-0 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full" title="Remover Membro">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
                 {group.membros.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2">Adicione membros a este grupo.</p>}
            </div>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={availableMembersForDropdown.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200 dark:hover:bg-sky-900/70 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>Adicionar Membro</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        <ul>
                            {availableMembersForDropdown.length > 0 ? (
                                availableMembersForDropdown.map(member => (
                                    <li key={member.id}>
                                        <button onClick={() => { onAddMember(group.id, member.id); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            {member.name}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 italic">Nenhum membro disponível</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrganizarEquipesPage;