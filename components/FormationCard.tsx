import React from 'react';
import { Equipe, Grupo, MembroComStatus, MembroStatus, Funcao } from '../types';
import { PersonIcon, UsersIcon } from './icons/IconComponents';
// Importe o StatusSelector do seu arquivo de componentes.
// Se ele ainda não foi extraído para seu próprio arquivo, você precisará fazê-lo.
import StatusSelector from './StatusSelector'; 

interface FormationCardProps {
    equipe: Equipe;
    teamMembersWithStatus: MembroComStatus[];
    groups: Grupo[];
    formationDetails: { veiculo: string; observacoes: string };
    onDetailsChange: (details: { veiculo: string; observacoes: string }) => void;
    // Removido onMemberPresenceChange
    // Adicionada a nova prop para atualização completa do status
    onStatusUpdate: (memberId: number | string, status: MembroStatus, observacao?: string) => void;
}

// Estas constantes podem viver aqui se forem específicas para este componente
// ou em um arquivo compartilhado (como `types.ts` ou `constants.ts`) se forem usadas em outros lugares.
const STATUS_COLORS: Record<MembroStatus, { bg: string; text: string; }> = {
    'Ativo': { bg: 'bg-green-100 dark:bg-green-900/70', text: 'text-green-800 dark:text-green-200' },
    'Folga': { bg: 'bg-sky-100 dark:bg-sky-900/70', text: 'text-sky-800 dark:text-sky-200' },
    'Férias': { bg: 'bg-orange-100 dark:bg-orange-900/70', text: 'text-orange-800 dark:text-orange-200' },
    'Curso': { bg: 'bg-violet-100 dark:bg-violet-900/70', text: 'text-violet-800 dark:text-violet-200' },
    'GLM': { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-200' },
    'Observação': { bg: 'bg-yellow-100 dark:bg-yellow-900/70', text: 'text-yellow-800 dark:text-yellow-200' },
};

const FormationCard: React.FC<FormationCardProps> = ({ equipe, teamMembersWithStatus, groups, formationDetails, onDetailsChange, onStatusUpdate }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onDetailsChange({
            veiculo: name === 'veiculo' ? value : formationDetails.veiculo,
            observacoes: name === 'observacoes' ? value : formationDetails.observacoes,
        });
    };
    
    // Calcula a contagem de presentes para exibir no cabeçalho do card
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
                
                {/* Lista de Membros com Controle de Status */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Membros da Equipe
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {teamMembersWithStatus.length > 0 ? teamMembersWithStatus.map(member => (
                            <div key={member.uuid} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-sm">
                                <div className="flex items-center gap-3">
                                    <StatusSelector
                                        member={member}
                                        onStatusChange={(status, obs) => onStatusUpdate(member.id, status, obs)}
                                        disabled={member.status === 'Férias'}
                                    />
                                    <span className={`flex-grow text-slate-700 dark:text-slate-300 ${member.status !== 'Ativo' ? 'line-through opacity-60' : ''}`}>
                                        {member.name}
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${STATUS_COLORS[member.status]?.bg || ''} ${STATUS_COLORS[member.status]?.text || ''}`}>
                                    {member.status === 'Observação' && member.observacao ? member.observacao : member.status}
                                </span>
                            </div>
                         )) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-4">Nenhum membro nesta equipe.</p>
                         )}
                    </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Seção de detalhes (Veículo e Observações) */}
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