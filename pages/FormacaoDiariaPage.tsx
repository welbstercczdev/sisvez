import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast'; // Importe o toast para as novas mensagens
import { HomeIcon, PrinterIcon, SaveIcon, ClockHistoryIcon } from '../components/icons/IconComponents';
import { Equipe, User, FormacaoDiaria, MembroComStatus, MembroStatus, Grupo, OrganizacaoSalva } from '../types';
import FormationCard from '../components/FormationCard';
import HistoricoFormacaoModal from '../components/HistoricoFormacaoModal';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec'; // SUBSTITUA PELA SUA URL REAL

// ====================== MODIFICAÇÕES NAS PROPS ======================
interface FormacaoDiariaPageProps {
    onNavigate: (page: string) => void;
    currentDate: string;
    setCurrentDate: (date: string) => void;
    // Tipagem da chave do Map e do ID do membro atualizada para 'number | string'
    dailyStatuses: Map<number | string, MembroComStatus>;
    onStatusUpdate: (memberId: number | string, status: MembroStatus, observacao?: string) => void;
    equipes: Equipe[];
    dailyGroups: Map<string, Grupo[]>;
    historicoOrganizacoes: OrganizacaoSalva[];
}
// =======================================================================

const FormacaoDiariaPage: React.FC<FormacaoDiariaPageProps> = ({ onNavigate, currentDate, setCurrentDate, dailyStatuses, onStatusUpdate, equipes, dailyGroups, historicoOrganizacoes }) => {
    const [formacaoDetails, setFormacaoDetails] = useState<Map<string, { veiculo: string; observacoes: string }>>(new Map());
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Efeito para buscar formações salvas quando a data muda
    useEffect(() => {
        // Zera os detalhes ao mudar de data para não carregar dados do dia anterior
        setFormacaoDetails(new Map());

        const fetchFormacoesDoDia = async () => {
            setIsLoading(true);
            try {
                const url = new URL(GOOGLE_SCRIPT_URL);
                url.searchParams.append('api', 'formacaoDiaria');
                url.searchParams.append('date', currentDate);

                const response = await fetch(url.toString());
                const result = await response.json();

                if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                    const savedFormations: FormacaoDiaria[] = result.data;
                    
                    // Atualiza os detalhes (veículo, observações) com os dados salvos
                    setFormacaoDetails(prevDetails => {
                        const newDetails = new Map(prevDetails);
                        savedFormations.forEach(formacao => {
                            newDetails.set(formacao.equipeId, {
                                veiculo: formacao.veiculo,
                                observacoes: formacao.observacoes
                            });
                        });
                        return newDetails;
                    });

                    // Cria um conjunto com os UUIDs de todos os membros que estavam presentes na formação salva
                    const presentMemberUuids = new Set<string>();
                    savedFormations.forEach(formacao => {
                        (formacao.membrosPresentes || []).forEach(membro => presentMemberUuids.add(membro.uuid));
                    });

                    // ====================== LÓGICA CORRIGIDA AQUI ======================
                    dailyStatuses.forEach((status, memberId) => {
                        // A variável 'status' JÁ É o objeto MembroComStatus que precisamos.
                        // Não é necessário procurar novamente no Map.
                        const isPresent = presentMemberUuids.has(status.uuid);

                        if (isPresent && status.status !== 'Ativo') {
                            onStatusUpdate(memberId, 'Ativo');
                        } else if (!isPresent && status.status === 'Ativo') {
                            // Assume 'Folga' se não estava presente, pode ser ajustado
                            onStatusUpdate(memberId, 'Folga');
                        }
                    });
                    // =====================================================================

                    toast.success('Formação anterior carregada!');
                }
            } catch (err) {
                toast.error('Não foi possível carregar a formação salva.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormacoesDoDia();
    }, [currentDate]);
    
    const teamMembersWithStatus = useMemo(() => {
        const map = new Map<string, MembroComStatus[]>();
        equipes.forEach(equipe => {
            const allMemberIds = new Set<number | string>([equipe.lider.id, ...equipe.membros.map(m => m.id)]);
            const members: MembroComStatus[] = [];
            allMemberIds.forEach(id => {
                const status = dailyStatuses.get(id);
                if (status) {
                    members.push(status);
                }
            });
            map.set(equipe.id, members);
        });
        return map;
    }, [equipes, dailyStatuses]);

    const handleMemberPresenceChange = (memberId: number | string, isPresent: boolean) => {
        const currentStatus = dailyStatuses.get(memberId)?.status;
        if (isPresent && currentStatus !== 'Ativo') {
            onStatusUpdate(memberId, 'Ativo');
        } else if (!isPresent && currentStatus === 'Ativo') {
            onStatusUpdate(memberId, 'Folga');
        }
    };

    const handleDetailsChange = (equipeId: string, details: { veiculo: string; observacoes: string }) => {
        setFormacaoDetails(prev => new Map(prev).set(equipeId, details));
    };
    
    const handleSaveAll = async () => {
        const loadingToastId = toast.loading('Salvando formação do dia...');
        const activeEquipes = equipes.filter(e => e.status === 'Ativo');
        const payload: Omit<FormacaoDiaria, "uuid">[] = activeEquipes.map(equipe => {
            const details = formacaoDetails.get(equipe.id) || { veiculo: '', observacoes: '' };
            const allMembersOfTeam = teamMembersWithStatus.get(equipe.id) || [];
            const membrosPresentes = allMembersOfTeam.filter(membro => membro.status === 'Ativo');
            return {
                data: currentDate,
                equipeId: equipe.id,
                nomeEquipe: equipe.nome,
                lider: equipe.lider,
                membrosPresentes: membrosPresentes,
                veiculo: details.veiculo,
                observacoes: details.observacoes
            };
        });

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({ api: 'formacaoDiaria', payload }),
                headers: { "Content-Type": "text/plain;charset=utf-8" },
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            toast.success(result.message, { id: loadingToastId });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro.';
            toast.error(`Falha ao salvar: ${errorMessage}`, { id: loadingToastId });
        }
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
                            <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Formação Diária</span>
                        </div>
                        </li>
                    </ol>
                  </nav>
                </div>

                {/* Header and Actions */}
                <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Formação de Equipes</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Monte as equipes para as atividades do dia.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <input 
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                        />
                         <button onClick={() => setIsHistoricoModalOpen(true)} className="flex items-center justify-center gap-2 w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600">
                            <ClockHistoryIcon className="w-4 h-4" />
                            <span>Histórico</span>
                        </button>
                         <button onClick={handleSaveAll} className="flex items-center justify-center gap-2 w-auto px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                            <SaveIcon className="w-4 h-4" />
                            <span>Salvar</span>
                        </button>
                        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 border border-transparent rounded-md shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                            <PrinterIcon className="w-4 h-4" />
                            <span>Imprimir</span>
                        </button>
                    </div>
                </div>
                
                {/* Formation Cards Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">Carregando...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeEquipes.map(equipe => {
                             const details = formacaoDetails.get(equipe.id) || { veiculo: '', observacoes: ''};
                             const members = teamMembersWithStatus.get(equipe.id) || [];
                             const groups = dailyGroups.get(equipe.id) || [];

                             return (
                                <FormationCard 
                                    key={equipe.id}
                                    equipe={equipe}
                                    teamMembersWithStatus={members}
                                    groups={groups}
                                    formationDetails={details}
                                    onMemberPresenceChange={handleMemberPresenceChange}
                                    onDetailsChange={(newDetails) => handleDetailsChange(equipe.id, newDetails)}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
            
            <HistoricoFormacaoModal 
                isOpen={isHistoricoModalOpen}
                onClose={() => setIsHistoricoModalOpen(false)}
                historico={historicoOrganizacoes}
            />
        </>
    );
};

export default FormacaoDiariaPage;