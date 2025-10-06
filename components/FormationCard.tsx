import React from 'react';
import { Equipe, Grupo, MembroComStatus, Funcao, MembroStatus } from '../types';
import { PersonIcon, UsersIcon, CheckCircleFillIcon, XCircleFillIcon } from './icons/IconComponents';

interface FormationCardProps {
    equipe: Equipe;
    teamMembersWithStatus: MembroComStatus[];
    groups: Grupo[];
    formationDetails: { veiculo: string; observacoes: string };
    onMemberPresenceChange: (memberId: number, isPresent: boolean) => void;
    onDetailsChange: (details: { veiculo: string; observacoes: string }) => void;
}

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

const MemberToggle: React.FC<{ member: MembroComStatus; onToggle: () => void }> = ({ member, onToggle }) => {
    const isPresent = member.status === 'Ativo';
    const statusConfig = STATUS_COLORS[member.status] || STATUS_COLORS['GLM'];
    const displayText = member.status === 'Observação' && member.observacao ? member.observacao : member.status;

    return (
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between p-2 rounded-md transition-colors text-sm bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
            <span className="text-slate-700 dark:text-slate-300">{member.name}</span>
            
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                    {displayText}
                </span>
                {isPresent 
                    ? <CheckCircleFillIcon className="w-5 h-5 text-green-500 flex-shrink-0" /> 
                    : <XCircleFillIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />}
            </div>
        </button>
    );
};


const FormationCard: React.FC<FormationCardProps> = ({ equipe, teamMembersWithStatus, groups, formationDetails, onMemberPresenceChange, onDetailsChange }) => {

    const handleMemberToggle = (member: MembroComStatus) => {
        onMemberPresenceChange(member.id, member.status !== 'Ativo');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onDetailsChange({
            veiculo: name === 'veiculo' ? value : formationDetails.veiculo,
            observacoes: name === 'observacoes' ? value : formationDetails.observacoes,
        });
    };
    
    const groupedMemberIds = new Set(groups.flatMap(g => g.membros.map(m => m.id)));
    const unassignedMembers = teamMembersWithStatus.filter(m => !groupedMemberIds.has(m.id) && m.status === 'Ativo');
    const absentMembers = teamMembersWithStatus.filter(m => m.status !== 'Ativo');
    
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{equipe.nome}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <PersonIcon className="w-4 h-4" />
                    Líder: {equipe.lider.name}
                </p>
            </div>
            <div className="p-4 space-y-4 flex-grow">
                
                {/* Organized Groups */}
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
                                                    <span key={funcao} className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${FUNCAO_COLORS[funcao].bg} ${FUNCAO_COLORS[funcao].text}`}>
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

                {/* Presence Control */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Controle de Presença
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                         {unassignedMembers.length > 0 && (
                            <>
                                <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase pt-2">Presentes (Sem Grupo)</h5>
                                {unassignedMembers.map(member => <MemberToggle key={member.id} member={member} onToggle={() => handleMemberToggle(member)} />)}
                            </>
                         )}
                         {absentMembers.length > 0 && (
                            <>
                                <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase pt-2">Ausentes</h5>
                                {absentMembers.map(member => <MemberToggle key={member.id} member={member} onToggle={() => handleMemberToggle(member)} />)}
                            </>
                         )}
                         {unassignedMembers.length === 0 && absentMembers.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 italic">Todos os membros ativos estão em grupos.</p>}
                    </div>
                </div>

                 <div>
                    <label htmlFor={`veiculo-${equipe.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Viatura</label>
                    <input 
                        type="text" 
                        id={`veiculo-${equipe.id}`}
                        name="veiculo"
                        value={formationDetails.veiculo}
                        onChange={handleInputChange}
                        placeholder="Ex: Viatura 123"
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                 <div>
                    <label htmlFor={`observacoes-${equipe.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações / Tarefas do Dia</label>
                    <textarea
                        id={`observacoes-${equipe.id}`}
                        name="observacoes"
                        value={formationDetails.observacoes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Ex: Foco na nebulização do bairro X..."
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 resize-y"
                    />
                </div>
            </div>
        </div>
    );
};

export default FormationCard;
