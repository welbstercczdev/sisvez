import React, { useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { HomeIcon, PlusIcon, SearchIcon, ClockHistoryIcon } from '../components/icons/IconComponents';
import InserirEquipeModal from '../components/InserirEquipeModal';
import { Equipe, User, OrganizacaoSalva } from '../types';
import EquipeCard from '../components/EquipeCard';
import EditarEquipeModal from '../components/EditarEquipeModal';
import HistoricoEquipeModal from '../components/HistoricoEquipeModal';
import HistoricoFormacaoModal from '../components/HistoricoFormacaoModal';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec'; // SUBSTITUA PELA SUA URL REAL

interface EquipesPageProps {
    onNavigate: (page: string) => void;
    historicoOrganizacoes: OrganizacaoSalva[];
    equipes: Equipe[];
    usuarios: User[];
    onDataUpdate: () => void; // Função para recarregar os dados
}

const EquipesPage: React.FC<EquipesPageProps> = ({ onNavigate, historicoOrganizacoes, equipes, usuarios, onDataUpdate }) => {
    // Estados para controle dos modais e UI
    const [isInserirModalOpen, setIsInserirModalOpen] = useState(false);
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [isFormacaoHistoricoModalOpen, setIsFormacaoHistoricoModalOpen] = useState(false);
    const [equipeParaEditar, setEquipeParaEditar] = useState<Equipe | null>(null);
    const [equipeComHistorico, setEquipeComHistorico] = useState<Equipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Função genérica para chamadas POST
    const postData = async (action: string, payload: any) => {
        const loadingToastId = toast.loading('Processando sua solicitação...');
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({ api: 'equipes', action, payload, user: 'WELBSTER' }), // Adicione o usuário logado aqui
                headers: { "Content-Type": "text/plain;charset=utf-8" },
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            
            toast.success(result.message || 'Operação realizada com sucesso!', { id: loadingToastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro.';
            toast.error(`Falha: ${errorMessage}`, { id: loadingToastId });
            return false;
        }
    };

    const handleSaveEquipe = async (novaEquipe: Omit<Equipe, 'id' | 'historico'>) => {
        const success = await postData('create', novaEquipe);
        if (success) {
            setIsInserirModalOpen(false);
            onDataUpdate(); // Pede para o App.tsx recarregar os dados
        }
    };

    const handleUpdateEquipe = async (equipeAtualizada: Equipe) => {
        const success = await postData('update', equipeAtualizada);
        if (success) {
            setIsEditarModalOpen(false);
            onDataUpdate(); // Pede para o App.tsx recarregar os dados
        }
    };

    const handleDeleteEquipe = (equipeParaExcluir: Equipe) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p>Tem certeza que deseja excluir a equipe <strong>"{equipeParaExcluir.nome}"</strong>?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const success = await postData('delete', { equipeId: equipeParaExcluir.id });
                            if (success) onDataUpdate();
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Excluir
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1 px-2 rounded text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    // Lógica de filtragem de usuários disponíveis
    const assignedUserUuids = useMemo(() => {
        const uuids = new Set<string>();
        equipes.forEach(equipe => {
            if (equipe.lider) uuids.add(equipe.lider.uuid);
            if (equipe.membros) equipe.membros.forEach(membro => uuids.add(membro.uuid));
        });
        return uuids;
    }, [equipes]);

    const availableUsersForInsert = useMemo(() => {
        return usuarios.filter(user => !assignedUserUuids.has(user.uuid));
    }, [usuarios, assignedUserUuids]);

    const availableUsersForEdit = useMemo(() => {
        if (!equipeParaEditar) return [];
        const currentTeamUuids = new Set<string>();
        if (equipeParaEditar.lider) currentTeamUuids.add(equipeParaEditar.lider.uuid);
        if (equipeParaEditar.membros) equipeParaEditar.membros.forEach(m => currentTeamUuids.add(m.uuid));
        return usuarios.filter(user => !assignedUserUuids.has(user.uuid) || currentTeamUuids.has(user.uuid));
    }, [usuarios, assignedUserUuids, equipeParaEditar]);
    
    // Funções para abrir modais
    const handleOpenEditModal = (equipe: Equipe) => {
        setEquipeParaEditar(equipe);
        setIsEditarModalOpen(true);
    };

    const handleOpenHistoricoModal = (equipe: Equipe) => {
        setEquipeComHistorico(equipe);
        setIsHistoricoModalOpen(true);
    };
    
    // Lógica para filtrar as equipes exibidas
    const filteredEquipes = useMemo(() => 
        equipes.filter(e => 
            e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.lider && e.lider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (e.membros && e.membros.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())))
        ), [equipes, searchTerm]);

  return (
    <>
        <Toaster position="top-right" />
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
                    <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Equipes</span>
                </div>
                </li>
            </ol>
            </nav>
        </div>
        
        {/* Header and Actions */}
        <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gerenciamento de Equipes</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crie, edite e organize suas equipes de trabalho.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-grow">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input 
                        type="text"
                        placeholder="Buscar equipe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm pl-10 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <button onClick={() => setIsFormacaoHistoricoModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600">
                    <ClockHistoryIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Histórico de Formações</span>
                </button>
                <button onClick={() => setIsInserirModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Nova Equipe</span>
                </button>
            </div>
        </div>

        {/* Cards grid */}
        {filteredEquipes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEquipes.map(equipe => (
                    <EquipeCard
                        key={equipe.id}
                        equipe={equipe}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteEquipe}
                        onHistory={handleOpenHistoricoModal}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
                <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm ? `Nenhuma equipe encontrada para "${searchTerm}".` : "Nenhuma equipe cadastrada."}
                </p>
                {!searchTerm && (
                    <button onClick={() => setIsInserirModalOpen(true)} className="mt-4 flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                        <PlusIcon className="w-5 h-5" />
                        <span>Criar Primeira Equipe</span>
                    </button>
                )}
            </div>
        )}

        </section>

        {/* Modais */}
        <InserirEquipeModal 
            isOpen={isInserirModalOpen}
            onClose={() => setIsInserirModalOpen(false)}
            onSave={handleSaveEquipe}
            availableUsers={availableUsersForInsert}
        />
        <EditarEquipeModal
            isOpen={isEditarModalOpen}
            onClose={() => setIsEditarModalOpen(false)}
            onSave={handleUpdateEquipe}
            equipe={equipeParaEditar}
            availableUsers={availableUsersForEdit}
        />
        <HistoricoEquipeModal
            isOpen={isHistoricoModalOpen}
            onClose={() => setIsHistoricoModalOpen(false)}
            equipe={equipeComHistorico}
        />
        <HistoricoFormacaoModal
            isOpen={isFormacaoHistoricoModalOpen}
            onClose={() => setIsFormacaoHistoricoModalOpen(false)}
            historico={historicoOrganizacoes}
        />
    </>
  );
};

export default EquipesPage;