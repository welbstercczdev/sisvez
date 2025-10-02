import React, { useState, useMemo } from 'react';
import { 
    HomeIcon, 
    PlusIcon,
    SearchIcon,
    ClockHistoryIcon,
} from '../components/icons/IconComponents';
import InserirEquipeModal from '../components/InserirEquipeModal';
import { Equipe, User, HistoricoEquipe, HistoricoAcao, OrganizacaoSalva } from '../types';
import EquipeCard from '../components/EquipeCard';
import EditarEquipeModal from '../components/EditarEquipeModal';
import HistoricoEquipeModal from '../components/HistoricoEquipeModal';
import HistoricoFormacaoModal from '../components/HistoricoFormacaoModal';

interface EquipesPageProps {
    onNavigate: (page: string) => void;
    historicoOrganizacoes: OrganizacaoSalva[];
}

const DUMMY_USERS: User[] = [
    { id: 1, name: 'Ana Silva' },
    { id: 2, name: 'Bruno Costa' },
    { id: 3, name: 'Carla Dias' },
    { id: 4, name: 'Daniel Farias' },
    { id: 5, name: 'Elisa Gomes' },
    { id: 6, name: 'Fábio Lima' },
    { id: 7, name: 'Mariana Oliveira' },
    { id: 8, name: 'Pedro Martins' }
];

const DUMMY_HISTORICO_1: HistoricoEquipe[] = [
    { id: 'H1A', data: '2023-01-10T09:00:00Z', usuario: 'Admin', acao: 'criacao', detalhes: { para: 'Equipe de Campo - Setor 1' } },
    { id: 'H1B', data: '2023-03-22T15:10:00Z', usuario: 'Gestor A', acao: 'mudanca_status', detalhes: { de: 'Inativo', para: 'Ativo' } }
];

const DUMMY_HISTORICO_2: HistoricoEquipe[] = [
    { id: 'H2A', data: '2023-02-15T11:00:00Z', usuario: 'Admin', acao: 'criacao', detalhes: { para: 'Equipe de Análise - Central' } },
    { id: 'H2B', data: '2023-06-01T10:00:00Z', usuario: 'Gestor B', acao: 'troca_lider', detalhes: { de: 'Daniel Farias', para: 'Elisa Gomes' } },
    { id: 'H2C', data: '2023-08-05T18:00:00Z', usuario: 'Gestor B', acao: 'rem_membro', detalhes: { membro: 'Fábio Lima' } }
];

const EquipesPage: React.FC<EquipesPageProps> = ({ onNavigate, historicoOrganizacoes }) => {
    const [isInserirModalOpen, setIsInserirModalOpen] = useState(false);
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [isFormacaoHistoricoModalOpen, setIsFormacaoHistoricoModalOpen] = useState(false);
    const [equipeParaEditar, setEquipeParaEditar] = useState<Equipe | null>(null);
    const [equipeComHistorico, setEquipeComHistorico] = useState<Equipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [equipes, setEquipes] = useState<Equipe[]>([
      { id: 'EQ-1672532400000', nome: 'Equipe de Campo - Setor 1', lider: DUMMY_USERS[0], membros: [DUMMY_USERS[1], DUMMY_USERS[2]], status: 'Ativo', historico: DUMMY_HISTORICO_1 },
      { id: 'EQ-1672532500000', nome: 'Equipe de Análise - Central', lider: DUMMY_USERS[3], membros: [DUMMY_USERS[4], DUMMY_USERS[5], DUMMY_USERS[6]], status: 'Ativo', historico: DUMMY_HISTORICO_2 },
      { id: 'EQ-1672532600000', nome: 'Brigada Leste', lider: DUMMY_USERS[7], membros: [DUMMY_USERS[0]], status: 'Inativo', historico: [{ id: 'H3A', data: '2023-04-01T08:00:00Z', usuario: 'Admin', acao: 'criacao', detalhes: { para: 'Brigada Leste' } }] },
    ]);

    const handleSaveEquipe = (novaEquipe: Equipe) => {
        setEquipes(prevEquipes => [...prevEquipes, { ...novaEquipe, historico: [{ id: `H-${Date.now()}`, data: new Date().toISOString(), usuario: 'WELBSTER', acao: 'criacao', detalhes: { para: novaEquipe.nome }}] }]);
        setIsInserirModalOpen(false);
    };

    const handleUpdateEquipe = (equipeAtualizada: Equipe) => {
        const equipeOriginal = equipes.find(e => e.id === equipeAtualizada.id);
        if (!equipeOriginal) return;

        const novosRegistrosHistorico: HistoricoEquipe[] = [];
        const data = new Date().toISOString();
        const usuario = 'WELBSTER'; // Hardcoded user for now

        // Check for name change
        if (equipeOriginal.nome !== equipeAtualizada.nome) {
            novosRegistrosHistorico.push({ id: `H-${Date.now()}-NOME`, data, usuario, acao: 'edicao_nome', detalhes: { de: equipeOriginal.nome, para: equipeAtualizada.nome }});
        }
        
        // Check for leader change
        if (equipeOriginal.lider.id !== equipeAtualizada.lider.id) {
            novosRegistrosHistorico.push({ id: `H-${Date.now()}-LIDER`, data, usuario, acao: 'troca_lider', detalhes: { de: equipeOriginal.lider.name, para: equipeAtualizada.lider.name }});
        }

        // Check for status change
        if (equipeOriginal.status !== equipeAtualizada.status) {
            novosRegistrosHistorico.push({ id: `H-${Date.now()}-STATUS`, data, usuario, acao: 'mudanca_status', detalhes: { de: equipeOriginal.status, para: equipeAtualizada.status }});
        }
        
        // Check for member changes
        const originalMemberIds = new Set(equipeOriginal.membros.map(m => m.id));
        const updatedMemberIds = new Set(equipeAtualizada.membros.map(m => m.id));

        equipeAtualizada.membros.forEach(membro => {
            if (!originalMemberIds.has(membro.id)) {
                novosRegistrosHistorico.push({ id: `H-${Date.now()}-ADD-${membro.id}`, data, usuario, acao: 'add_membro', detalhes: { membro: membro.name }});
            }
        });

        equipeOriginal.membros.forEach(membro => {
            if (!updatedMemberIds.has(membro.id)) {
                 novosRegistrosHistorico.push({ id: `H-${Date.now()}-REM-${membro.id}`, data, usuario, acao: 'rem_membro', detalhes: { membro: membro.name }});
            }
        });

        const historicoAntigo = equipeOriginal.historico || [];
        
        setEquipes(prev => prev.map(e => e.id === equipeAtualizada.id ? {...equipeAtualizada, historico: [...historicoAntigo, ...novosRegistrosHistorico] } : e));
        setIsEditarModalOpen(false);
    };

    const handleOpenEditModal = (equipe: Equipe) => {
        setEquipeParaEditar(equipe);
        setIsEditarModalOpen(true);
    };

    const handleOpenHistoricoModal = (equipe: Equipe) => {
        setEquipeComHistorico(equipe);
        setIsHistoricoModalOpen(true);
    }

    const handleDeleteEquipe = (equipeParaExcluir: Equipe) => {
        if (window.confirm(`Tem certeza que deseja excluir a equipe "${equipeParaExcluir.nome}"?`)) {
            setEquipes(prev => prev.filter(e => e.id !== equipeParaExcluir.id));
        }
    };
    
    const filteredEquipes = useMemo(() => 
        equipes.filter(e => 
            e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.lider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.membros.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [equipes, searchTerm]);

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

        <InserirEquipeModal 
            isOpen={isInserirModalOpen}
            onClose={() => setIsInserirModalOpen(false)}
            onSave={handleSaveEquipe}
        />
        <EditarEquipeModal
            isOpen={isEditarModalOpen}
            onClose={() => setIsEditarModalOpen(false)}
            onSave={handleUpdateEquipe}
            equipe={equipeParaEditar}
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