import React, { useState, useMemo, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Equipe, Grupo, MembroComStatus, MembroStatus, Funcao, User, MembroPresente } from '../types';
import { PersonIcon, UsersIcon, UserPlusIcon, ArrowLeftRightIcon, ChevronDownIcon } from './icons/IconComponents';
import StatusSelector from './StatusSelector';

// Essas constantes podem ser importadas de um arquivo centralizado se desejar
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
    'Emprestado': { bg: 'bg-pink-100 dark:bg-pink-900/70', text: 'text-pink-800 dark:text-pink-200' },
};


// --- Subcomponente para a UI de Empréstimo ---
const BorrowControl: React.FC<{
    allTeams: Equipe[];
    allUsers: User[];
    currentTeam: Equipe;
    teamMembersWithStatus: MembroPresente[];
    onBorrow: (member: User, fromTeam: Equipe, toTeamId: string) => void;
}> = ({ allTeams, allUsers, currentTeam, teamMembersWithStatus, onBorrow }) => {
    const [isBorrowing, setIsBorrowing] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedMemberUuid, setSelectedMemberUuid] = useState<string>('');

    const otherTeams = useMemo(() => allTeams.filter(t => t.id !== currentTeam.id && t.status === 'Ativo'), [allTeams, currentTeam]);
    
    const availableMembersToBorrow = useMemo(() => {
        if (!selectedTeamId) return [];
        const sourceTeam = allTeams.find(t => t.id === selectedTeamId);
        if (!sourceTeam) return [];
        
        // Membros da equipe de origem que não estão em férias
        const sourceTeamMembers = [sourceTeam.lider, ...sourceTeam.membros];
        const currentTeamMemberUuids = new Set(teamMembersWithStatus.map(m => m.uuid));

        // Filtra para não mostrar membros que já estão na equipe atual (mesmo que emprestados)
        return sourceTeamMembers.filter(member => !currentTeamMemberUuids.has(member.uuid));
    }, [selectedTeamId, allTeams, teamMembersWithStatus]);

    const handleConfirmBorrow = () => {
        const fromTeam = allTeams.find(t => t.id === selectedTeamId);
        const member = allUsers.find(u => u.uuid === selectedMemberUuid);
        if (fromTeam && member) {
            onBorrow(member, fromTeam, currentTeam.id);
            setIsBorrowing(false);
            setSelectedTeamId('');
            setSelectedMemberUuid('');
        }
    };

    if (!isBorrowing) {
        return (
            <button onClick={() => setIsBorrowing(true)} className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 rounded-md">
                <UserPlusIcon className="w-4 h-4"/> Emprestar Membro
            </button>
        );
    }

    return (
        <div className="mt-2 p-3 space-y-2 bg-slate-200 dark:bg-slate-700 rounded-lg animate-fade-in">
            <select value={selectedTeamId} onChange={e => { setSelectedTeamId(e.target.value); setSelectedMemberUuid(''); }} className="w-full bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                <option value="">De qual equipe?</option>
                {otherTeams.map(team => <option key={team.id} value={team.id}>{team.nome}</option>)}
            </select>
            <select value={selectedMemberUuid} onChange={e => setSelectedMemberUuid(e.target.value)} disabled={!selectedTeamId || availableMembersToBorrow.length === 0} className="w-full bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50">
                <option value="">Qual membro?</option>
                {availableMembersToBorrow.map(member => <option key={member.uuid} value={member.uuid}>{member.name} ({member.id})</option>)}
            </select>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsBorrowing(false)} className="px-3 py-1 text-xs font-medium rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">Cancelar</button>
                <button type="button" onClick={handleConfirmBorrow} disabled={!selectedMemberUuid} className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md disabled:opacity-50 hover:bg-indigo-700">Confirmar</button>
            </div>
        </div>
    );
};
interface FormationCardProps {
    equipe: Equipe;
    teamMembersWithStatus: MembroPresente[];
    allTeams: Equipe[];
    allUsers: User[];
    groups: Grupo[];
    formationDetails: { veiculo: string; observacoes: string };
    onDetailsChange: (details: { veiculo: string; observacoes: string }) => void;
    onStatusUpdate: (memberId: number | string, status: MembroStatus, observacao?: string) => void; 
    onBorrowMember: (member: User, fromTeam: Equipe, toTeamId: string) => void;
}

const FormationCard: React.FC<FormationCardProps> = ({ equipe, teamMembersWithStatus, allTeams, allUsers, groups, formationDetails, onDetailsChange, onStatusUpdate, onBorrowMember }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onDetailsChange({
            veiculo: name === 'veiculo' ? value : formationDetails.veiculo,
            observacoes: name === 'observacoes' ? value : formationDetails.observacoes,
        });
    };
    
    const membersPresentCount = teamMembersWithStatus.filter(m => m.status === 'Ativo').length;
    const totalMembersCount = teamMembersWithStatus.length;
    
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{equipe.nome}</h3>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {membersPresentCount} / {totalMembersCount}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <PersonIcon className="w-4 h-4" />
                    Líder: {equipe.lider.name}
                </p>
            </div>
            <div className="p-4 space-y-4 flex-grow">
                
                {/* Exibição dos Grupos Formados */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Grupos Formados</h4>
                    <div className="space-y-3">
                        {groups.length > 0 ? groups.map(group => (
                            <div key={group.id} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">{group.nome}</p>
                                <ul className="space-y-1">
                                    {group.membros.map(member => (
                                        <li key={member.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span>- {member.name}</span>
                                            <div className="flex flex-wrap gap-1">
                                                {member.funcoes.map(funcao => (
                                                    <span key={funcao} className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${FUNCAO_COLORS[funcao]?.bg} ${FUNCAO_COLORS[funcao]?.text}`}>
                                                        {funcao}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )) : <p className="text-xs text-slate-500 dark:text-slate-400 italic">Nenhum grupo formado para hoje.</p>}
                    </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Controle de Status e Empréstimo */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Membros da Equipe
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {teamMembersWithStatus.length > 0 ? teamMembersWithStatus.map(member => (
                            <div key={member.uuid} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <StatusSelector
                                            member={member}
                                            onStatusChange={(status, obs) => onStatusUpdate(member.id, status, obs)}
                                            disabled={member.status === 'Férias' || member.status === 'Emprestado'}
                                        />
                                        <span className={`flex-grow text-slate-700 dark:text-slate-300 ${member.status !== 'Ativo' ? 'line-through opacity-60' : ''}`}>
                                            {member.name}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${STATUS_COLORS[member.status]?.bg || ''} ${STATUS_COLORS[member.status]?.text || ''}`}>
                                        {member.status === 'Observação' && member.observacao ? member.observacao : member.status}
                                    </span>
                                </div>
                                {member.equipeOrigem && (
                                    <div className="mt-1 pl-9 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                                        <ArrowLeftRightIcon className="w-3 h-3" />
                                        <span>Emprestado de: {member.equipeOrigem.nome}</span>
                                    </div>
                                )}
                            </div>
                         )) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-4">Nenhum membro nesta equipe.</p>
                         )}
                    </div>
                    <BorrowControl allTeams={allTeams} allUsers={allUsers} currentTeam={equipe} teamMembersWithStatus={teamMembersWithStatus} onBorrow={onBorrowMember} />
                </div>

                 <div>
                    <label htmlFor={`veiculo-${equipe.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Viatura</label>
                    <input type="text" id={`veiculo-${equipe.id}`} name="veiculo" value={formationDetails.veiculo} onChange={handleInputChange} placeholder="Ex: Viatura 123" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"/>
                </div>
                 <div>
                    <label htmlFor={`observacoes-${equipe.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações / Tarefas do Dia</label>
                    <textarea id={`observacoes-${equipe.id}`} name="observacoes" value={formationDetails.observacoes} onChange={handleInputChange} rows={3} placeholder="Ex: Foco na nebulização do bairro X..." className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 resize-y"/>
                </div>
            </div>
        </div>
    );
};

export default FormationCard;