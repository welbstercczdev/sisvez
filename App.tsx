import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SinanPage from './pages/SinanPage';
import FichasVezPage from './pages/FichasVezPage';
import AtividadesVezPage from './pages/AtividadesVezPage';
import AgrupamentosPage from './pages/AgrupamentosPage';
import ImoveisEspeciaisPage from './pages/ImoveisEspeciaisPage';
import ADLPage from './pages/ADLPage';
import BrigadasPage from './pages/BrigadasPage';
import InformativosPage from './pages/InformativosPage';
import FormulariosPage from './pages/FormulariosPage';
import MapasClassificacaoPage from './pages/MapasClassificacaoPage';
import PesquisarFichasVezPage from './pages/PesquisarFichasVezPage';
import PerfilPage from './pages/PerfilPage';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import EquipesPage from './pages/EquipesPage';
import DemandasPage from './pages/DemandasPage';
import AtividadeNebulizacaoPage from './pages/AtividadeNebulizacaoPage';
import AtividadeControleCriadourosPage from './pages/AtividadeControleCriadourosPage';
import DemandasLiderPage from './pages/DemandasLiderPage';
import ViewDemandaPage from './pages/ViewDemandaPage';
import FormacaoDiariaPage from './pages/FormacaoDiariaPage';
import OrganizarEquipesPage from './pages/OrganizarEquipesPage';
import FeriasPage from './pages/FeriasPage';
import { Demanda, Atividade, MembroComStatus, MembroStatus, User, Equipe, Grupo, Ferias, OrganizacaoSalva } from './types';

// Centralized Mock Data
const DUMMY_USERS: User[] = [
    { id: 1, name: 'Ana Silva' }, { id: 2, name: 'Bruno Costa' }, { id: 3, name: 'Carla Dias' },
    { id: 4, name: 'Daniel Farias' }, { id: 5, name: 'Elisa Gomes' }, { id: 6, name: 'Fábio Lima' },
    { id: 7, name: 'Mariana Oliveira' }, { id: 8, name: 'Pedro Martins' }, { id: 9, name: 'Sofia Pereira' },
    { id: 10, name: 'Rafael Santos' }
];

const DUMMY_EQUIPES: Equipe[] = [
      { id: 'EQ-1', nome: 'Equipe de Campo - Setor 1', lider: DUMMY_USERS[0], membros: [DUMMY_USERS[1], DUMMY_USERS[2]], status: 'Ativo' },
      { id: 'EQ-2', nome: 'Equipe de Análise - Central', lider: DUMMY_USERS[3], membros: [DUMMY_USERS[4], DUMMY_USERS[5], DUMMY_USERS[6]], status: 'Ativo' },
      { id: 'EQ-3', nome: 'Brigada Leste', lider: DUMMY_USERS[7], membros: [DUMMY_USERS[8], DUMMY_USERS[9]], status: 'Ativo' },
      { id: 'EQ-4', nome: 'Equipe de Nebulização', lider: DUMMY_USERS[1], membros: [DUMMY_USERS[2], DUMMY_USERS[6], DUMMY_USERS[7]], status: 'Ativo' },
];

const getTodayPlusDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const DUMMY_FERIAS: Ferias[] = [
    { id: 'FER-1', funcionario: DUMMY_USERS[4], dataInicio: getTodayPlusDays(-5), dataFim: getTodayPlusDays(10), status: 'Em Andamento' },
    { id: 'FER-2', funcionario: DUMMY_USERS[7], dataInicio: getTodayPlusDays(15), dataFim: getTodayPlusDays(30), status: 'Agendada' },
    { id: 'FER-3', funcionario: DUMMY_USERS[1], dataInicio: getTodayPlusDays(-30), dataFim: getTodayPlusDays(-15), status: 'Concluída' },
    { id: 'FER-4', funcionario: DUMMY_USERS[9], dataInicio: getTodayPlusDays(45), dataFim: getTodayPlusDays(60), status: 'Agendada' },
    { id: 'FER-5', funcionario: DUMMY_USERS[0], dataInicio: getTodayPlusDays(-40), dataFim: getTodayPlusDays(-25), status: 'Cancelada' },
];

const DUMMY_ORGANIZACOES_SALVAS: OrganizacaoSalva[] = [
    {
        id: 'ORG-1', data: getTodayPlusDays(-2), dataSalvamento: `${getTodayPlusDays(-2)}T08:05:00Z`,
        usuarioSalvo: { id: 99, name: 'WELBSTER' }, equipe: DUMMY_EQUIPES[0],
        grupos: [ { id: 'g1-1', nome: 'Dupla 1', membros: [ { id: 1, name: 'Ana Silva', funcoes: ['Motorista', 'Aplicador'] }, { id: 2, name: 'Bruno Costa', funcoes: ['Anotador'] } ]} ],
        membrosStatus: [
            { id: 1, name: 'Ana Silva', status: 'Ativo' },
            { id: 2, name: 'Bruno Costa', status: 'Ativo' },
            { id: 3, name: 'Carla Dias', status: 'Folga' },
        ]
    },
    {
        id: 'ORG-2', data: getTodayPlusDays(-2), dataSalvamento: `${getTodayPlusDays(-2)}T08:10:00Z`,
        usuarioSalvo: { id: 98, name: 'GESTOR' }, equipe: DUMMY_EQUIPES[1],
        grupos: [ { id: 'g2-1', nome: 'Trio 1', membros: [ { id: 4, name: 'Daniel Farias', funcoes: ['Facilitador'] }, { id: 5, name: 'Elisa Gomes', funcoes: ['Anotador'] }, { id: 6, name: 'Fábio Lima', funcoes: ['Anotador'] } ]} ],
        membrosStatus: [
            { id: 4, name: 'Daniel Farias', status: 'Ativo' },
            { id: 5, name: 'Elisa Gomes', status: 'Ativo' },
            { id: 6, name: 'Fábio Lima', status: 'Ativo' },
            { id: 7, name: 'Mariana Oliveira', status: 'GLM' },
        ]
    },
     {
        id: 'ORG-3', data: getTodayPlusDays(-1), dataSalvamento: `${getTodayPlusDays(-1)}T08:00:00Z`,
        usuarioSalvo: { id: 99, name: 'WELBSTER' }, equipe: DUMMY_EQUIPES[0],
        grupos: [ 
            { id: 'g3-1', nome: 'Solo 1', membros: [ { id: 1, name: 'Ana Silva', funcoes: ['Motorista'] } ]},
            { id: 'g3-2', nome: 'Solo 2', membros: [ { id: 3, name: 'Carla Dias', funcoes: ['Aplicador'] } ]}
        ],
        membrosStatus: [
            { id: 1, name: 'Ana Silva', status: 'Ativo' },
            { id: 2, name: 'Bruno Costa', status: 'Observação', observacao: 'Reunião' },
            { id: 3, name: 'Carla Dias', status: 'Ativo' },
        ]
    },
    {
        id: 'ORG-4', data: '2024-08-15', dataSalvamento: '2024-08-14T09:00:00Z',
        usuarioSalvo: { id: 99, name: 'WELBSTER' }, equipe: DUMMY_EQUIPES[3],
        grupos: [ 
            { id: 'g4-1', nome: 'Trio Alfa', membros: [ { id: 2, name: 'Bruno Costa', funcoes: ['Motorista', 'Aplicador'] }, { id: 3, name: 'Carla Dias', funcoes: ['Anotador'] }, { id: 7, name: 'Mariana Oliveira', funcoes: ['Aplicador'] } ]},
            { id: 'g4-2', nome: 'Trio Beta', membros: [ { id: 8, name: 'Pedro Martins', funcoes: ['Motorista', 'Aplicador'] } ]}
        ],
        membrosStatus: [ { id: 2, name: 'Bruno Costa', status: 'Ativo' }, { id: 3, name: 'Carla Dias', status: 'Ativo' }, { id: 7, name: 'Mariana Oliveira', status: 'Ativo' }, { id: 8, name: 'Pedro Martins', status: 'Ativo' } ]
    }
];

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


const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);
  const [notificationForDemanda, setNotificationForDemanda] = useState<Atividade | null>(null);

  // Shared state for daily team organization
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStatuses, setDailyStatuses] = useState<Map<number, MembroComStatus>>(new Map());
  const [dailyGroups, setDailyGroups] = useState<Map<string, Grupo[]>>(new Map());
  const [feriasList, setFeriasList] = useState<Ferias[]>(DUMMY_FERIAS);
  const [historicoOrganizacoes, setHistoricoOrganizacoes] = useState<OrganizacaoSalva[]>(DUMMY_ORGANIZACOES_SALVAS);

  // Initialize/reset states when date or vacation list changes
  useEffect(() => {
    const newStatuses = new Map<number, MembroComStatus>();
    const currentDateObj = new Date(currentDate + 'T00:00:00');

    DUMMY_USERS.forEach(user => {
        const activeVacation = feriasList.find(f => {
            const startDate = new Date(f.dataInicio + 'T00:00:00');
            const endDate = new Date(f.dataFim + 'T23:59:59');
            return f.funcionario.id === user.id &&
                   (f.status === 'Agendada' || f.status === 'Em Andamento') &&
                   currentDateObj >= startDate &&
                   currentDateObj <= endDate;
        });

        if (activeVacation) {
            newStatuses.set(user.id, { ...user, status: 'Férias' });
        } else {
            newStatuses.set(user.id, { ...user, status: 'Ativo' });
        }
    });
    
    setDailyStatuses(newStatuses);
    // When date changes, clear groups for the new day
    if(dailyGroups.size > 0 && !feriasList.find(f => f.funcionario.id > 0)) { // Simple check if it's not a vacation update
        setDailyGroups(new Map());
    }
  }, [currentDate, feriasList]);

  const updateDailyGroups = (teamId: string, newGroups: Grupo[]) => {
      setDailyGroups(prev => new Map(prev).set(teamId, newGroups));
  };

  const updateMemberStatus = (memberId: number, status: MembroStatus, observacao?: string) => {
    const currentMemberStatus = dailyStatuses.get(memberId);
    if (currentMemberStatus?.status === 'Férias' && status !== 'Férias') {
        alert('Não é possível alterar o status de um funcionário que está de férias.');
        return;
    }

    // Update the status map
    setDailyStatuses(prev => {
        const newStatuses = new Map(prev);
        const member = DUMMY_USERS.find(u => u.id === memberId);
        if (member) {
            newStatuses.set(memberId, { ...member, status, observacao: status === 'Observação' ? observacao : undefined });
        }
        return newStatuses;
    });

    // If member is now inactive, remove them from any group they are in
    if (status !== 'Ativo') {
        setDailyGroups(prevGroupsMap => {
            const newGroupsMap = new Map(prevGroupsMap);
            let mapWasChanged = false;

            newGroupsMap.forEach((groups, teamId) => {
                let teamGroupsChanged = false;
                const updatedGroups = groups.map(group => {
                    const initialMemberCount = group.membros.length;
                    const newMembros = group.membros.filter(m => m.id !== memberId);
                    if (newMembros.length < initialMemberCount) {
                        teamGroupsChanged = true;
                        return { ...group, membros: newMembros };
                    }
                    return group;
                });

                if (teamGroupsChanged) {
                    mapWasChanged = true;
                    // Filter out empty groups and update names
                    const finalGroups = updatedGroups
                        .filter(g => g.membros.length > 0)
                        .map(g => updateGroupName(g, updatedGroups));
                    newGroupsMap.set(teamId, finalGroups);
                }
            });

            return mapWasChanged ? newGroupsMap : prevGroupsMap;
        });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleNavigate = (page: string, data?: any) => {
    // The target page determines which state to set.
    if (page === 'view_demanda') {
      setSelectedDemanda(data as Demanda);
      setNotificationForDemanda(null);
    } else if (page === 'atividade_controle_criadouros' || page === 'atividade_nebulizacao') {
      setNotificationForDemanda(data as Atividade);
      setSelectedDemanda(null);
    } else {
      // If navigating to any other page, clear these context-specific states
      setSelectedDemanda(null);
      setNotificationForDemanda(null);
    }
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'sinan':
        return <SinanPage onNavigate={handleNavigate} />;
      case 'fichas_vez':
        return <FichasVezPage onNavigate={handleNavigate} />;
      case 'atividades_vez':
        return <AtividadesVezPage onNavigate={handleNavigate} />;
      case 'agrupamentos':
        return <AgrupamentosPage onNavigate={handleNavigate} />;
      case 'imoveis_especiais':
        return <ImoveisEspeciaisPage onNavigate={handleNavigate} />;
      case 'adl':
        return <ADLPage onNavigate={handleNavigate} />;
      case 'brigadas':
        return <BrigadasPage onNavigate={handleNavigate} />;
      case 'informativos':
        return <InformativosPage onNavigate={handleNavigate} />;
      case 'formularios':
        return <FormulariosPage onNavigate={handleNavigate} />;
      case 'mapas_classificacao':
        return <MapasClassificacaoPage onNavigate={handleNavigate} />;
      case 'pesquisar_fichas_vez':
        return <PesquisarFichasVezPage onNavigate={handleNavigate} />;
      case 'perfil':
        return <PerfilPage onNavigate={handleNavigate} />;
      case 'equipes':
        return <EquipesPage onNavigate={handleNavigate} historicoOrganizacoes={historicoOrganizacoes} />;
      case 'ferias':
        return <FeriasPage onNavigate={handleNavigate} feriasList={feriasList} setFeriasList={setFeriasList} allUsers={DUMMY_USERS} />;
      case 'formacao_diaria':
        return <FormacaoDiariaPage 
                    onNavigate={handleNavigate} 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    dailyStatuses={dailyStatuses} 
                    onStatusUpdate={updateMemberStatus} 
                    equipes={DUMMY_EQUIPES}
                    dailyGroups={dailyGroups}
                    historicoOrganizacoes={historicoOrganizacoes}
                />;
      case 'organizar_equipes':
        return <OrganizarEquipesPage 
                    onNavigate={handleNavigate} 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    dailyStatuses={dailyStatuses} 
                    onStatusUpdate={updateMemberStatus}
                    equipes={DUMMY_EQUIPES}
                    dailyGroups={dailyGroups}
                    onGroupsUpdate={updateDailyGroups}
                    historicoOrganizacoes={historicoOrganizacoes}
                    onHistoricoUpdate={setHistoricoOrganizacoes}
                />;
      case 'demandas':
        return <DemandasPage onNavigate={handleNavigate} />;
      case 'atividade_nebulizacao':
        return <AtividadeNebulizacaoPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={DUMMY_EQUIPES} />;
      case 'atividade_controle_criadouros':
        return <AtividadeControleCriadourosPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={DUMMY_EQUIPES} />;
      case 'demandas_lider':
        return <DemandasLiderPage onNavigate={handleNavigate} />;
      case 'view_demanda':
        const demandTeam = DUMMY_EQUIPES.find(e => e.lider.id === selectedDemanda?.responsavel?.id);
        const latestSavedOrganizationForDay = historicoOrganizacoes
            .filter(org => 
                org.equipe.id === demandTeam?.id &&
                org.data === selectedDemanda?.prazo
            )
            .sort((a, b) => new Date(b.dataSalvamento).getTime() - new Date(a.dataSalvamento).getTime())[0];

        return <ViewDemandaPage 
                    onNavigate={handleNavigate} 
                    demanda={selectedDemanda} 
                    gruposDoDia={latestSavedOrganizationForDay?.grupos || null}
                />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header onToggleSidebar={toggleSidebar} onNavigate={handleNavigate} />
      <Sidebar isOpen={isSidebarOpen} activePage={activePage} onNavigate={handleNavigate} />
      <main 
        className={`min-h-screen transition-[margin-left] duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}
      >
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
            {renderPage()}
            <Footer />
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default App;