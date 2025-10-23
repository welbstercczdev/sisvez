import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
import UsuariosPage from './pages/UsuariosPage';
import { Demanda, Atividade, MembroComStatus, MembroStatus, User, Equipe, Grupo, Ferias, OrganizacaoSalva, Role } from './types';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec'; // SUBSTITUA PELA SUA URL REAL

const getTodayPlusDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const DUMMY_FERIAS: Ferias[] = [
    { id: 'FER-1', funcionario: { uuid: 'dummy-uuid-5', id: 5, name: 'Elisa Gomes', roles: [] }, dataInicio: getTodayPlusDays(-5), dataFim: getTodayPlusDays(10), status: 'Em Andamento' },
    { id: 'FER-2', funcionario: { uuid: 'dummy-uuid-8', id: 8, name: 'Pedro Martins', roles: [] }, dataInicio: getTodayPlusDays(15), dataFim: getTodayPlusDays(30), status: 'Agendada' },
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
  
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [historicoOrganizacoes, setHistoricoOrganizacoes] = useState<OrganizacaoSalva[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);
  const [notificationForDemanda, setNotificationForDemanda] = useState<Atividade | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStatuses, setDailyStatuses] = useState<Map<number | string, MembroComStatus>>(new Map());
  const [dailyGroups, setDailyGroups] = useState<Map<string, Grupo[]>>(new Map());
  const [feriasList, setFeriasList] = useState<Ferias[]>(DUMMY_FERIAS);

  const fetchData = async () => {
    if (!isLoadingData) toast.loading('Atualizando dados...', { id: 'refetching-data' });
    else setIsLoadingData(true);
    
    try {
      const [usersRes, equipesRes, orgsRes] = await Promise.all([
        fetch(`${GOOGLE_SCRIPT_URL}?api=usuarios`),
        fetch(`${GOOGLE_SCRIPT_URL}?api=equipes`),
        fetch(`${GOOGLE_SCRIPT_URL}?api=organizacaoEquipes`)
      ]);
      const usersResult = await usersRes.json();
      const equipesResult = await equipesRes.json();
      const orgsResult = await orgsRes.json();

      if (usersResult.success) setUsuarios(usersResult.data || []);
      else throw new Error(usersResult.error || 'Falha ao buscar usuários.');

      if (equipesResult.success) setEquipes(equipesResult.data || []);
      else throw new Error(equipesResult.error || 'Falha ao buscar equipes.');

      if (orgsResult.success) setHistoricoOrganizacoes(orgsResult.data || []);
      else throw new Error(orgsResult.error || 'Falha ao buscar histórico de organizações.');
      
      if (!isLoadingData) toast.success('Dados atualizados!', { id: 'refetching-data' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados essenciais.';
      toast.error(errorMessage, { id: 'refetching-data' });
    } finally {
      if (isLoadingData) setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const newStatuses = new Map<number | string, MembroComStatus>();
    const currentDateObj = new Date(currentDate + 'T00:00:00');
    usuarios.forEach(user => {
        const activeVacation = feriasList.find(f => f.funcionario.id === user.id && (f.status === 'Agendada' || f.status === 'Em Andamento') && currentDateObj >= new Date(f.dataInicio + 'T00:00:00') && currentDateObj <= new Date(f.dataFim + 'T23:59:59'));
        newStatuses.set(user.id, { ...user, status: activeVacation ? 'Férias' : 'Ativo' });
    });
    setDailyStatuses(newStatuses);
  }, [currentDate, feriasList, usuarios]);

  useEffect(() => {
    if (!currentDate || equipes.length === 0) {
      const newGroupsMap = new Map<string, Grupo[]>();
      equipes.forEach(equipe => newGroupsMap.set(equipe.id, []));
      setDailyGroups(newGroupsMap);
      return;
    }
    const dateAsDDMMYYYY = new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'});
    const latestOrgByTeam = new Map<string, OrganizacaoSalva>();
    historicoOrganizacoes
        .filter(org => (org.data === currentDate || org.data === dateAsDDMMYYYY))
        .sort((a, b) => new Date(b.dataSalvamento).getTime() - new Date(a.dataSalvamento).getTime())
        .forEach(org => {
            if (!latestOrgByTeam.has(org.equipe.id)) {
                latestOrgByTeam.set(org.equipe.id, org);
            }
        });
    const newGroupsMap = new Map<string, Grupo[]>();
    equipes.forEach(equipe => {
        const savedOrg = latestOrgByTeam.get(equipe.id);
        newGroupsMap.set(equipe.id, savedOrg ? savedOrg.grupos : []);
    });
    setDailyGroups(newGroupsMap);
    if (latestOrgByTeam.size > 0) {
        toast.success("Organizações salvas para esta data foram carregadas.");
    }
  }, [currentDate, historicoOrganizacoes, equipes]);

  const updateDailyGroups = useCallback((teamId: string, newGroups: Grupo[]) => {
      setDailyGroups(prev => new Map(prev).set(teamId, newGroups));
  }, []);

  const updateMemberStatus = useCallback((memberId: number | string, status: MembroStatus, observacao?: string) => {
    const currentMemberStatus = dailyStatuses.get(memberId);
    if (currentMemberStatus?.status === 'Férias' && status !== 'Férias') {
        toast.error('Não é possível alterar o status de um funcionário que está de férias.');
        return;
    }
    setDailyStatuses(prev => {
        const newStatuses = new Map(prev);
        const member = usuarios.find(u => u.id === memberId);
        if (member) newStatuses.set(memberId, { ...member, status, observacao: status === 'Observação' ? observacao : undefined });
        return newStatuses;
    });
    if (status !== 'Ativo') {
        setDailyGroups(prevGroupsMap => {
            const newGroupsMap = new Map(prevGroupsMap);
            let mapWasChanged = false;
            newGroupsMap.forEach((groups: Grupo[], teamId) => {
                const groupsWithMemberRemoved = groups.map(group => ({ ...group, membros: group.membros.filter(m => m.id !== memberId) })).filter(g => g.membros.length > 0);
                if (groupsWithMemberRemoved.length === groups.length) return;
                mapWasChanged = true;
                const finalGroups = groupsWithMemberRemoved.map(g => updateGroupName(g, groupsWithMemberRemoved));
                newGroupsMap.set(teamId, finalGroups);
            });
            return mapWasChanged ? newGroupsMap : prevGroupsMap;
        });
    }
  }, [dailyStatuses, usuarios]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1200);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleNavigate = (page: string, data?: any) => {
    if (page === 'view_demanda') {
      setSelectedDemanda(data as Demanda);
      setNotificationForDemanda(null);
    } else if (page === 'atividade_controle_criadouros' || page === 'atividade_nebulizacao') {
      setNotificationForDemanda(data as Atividade);
      setSelectedDemanda(null);
    } else {
      setSelectedDemanda(null);
      setNotificationForDemanda(null);
    }
    setActivePage(page);
  };
  const renderPage = () => {
    if (isLoadingData) {
        return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Carregando dados do sistema...</div>;
    }

    switch (activePage) {
      case 'sinan': return <SinanPage onNavigate={handleNavigate} />;
      case 'fichas_vez': return <FichasVezPage onNavigate={handleNavigate} />;
      case 'atividades_vez': return <AtividadesVezPage onNavigate={handleNavigate} />;
      case 'agrupamentos': return <AgrupamentosPage onNavigate={handleNavigate} />;
      case 'imoveis_especiais': return <ImoveisEspeciaisPage onNavigate={handleNavigate} />;
      case 'adl': return <ADLPage onNavigate={handleNavigate} />;
      case 'brigadas': return <BrigadasPage onNavigate={handleNavigate} />;
      case 'informativos': return <InformativosPage onNavigate={handleNavigate} />;
      case 'formularios': return <FormulariosPage onNavigate={handleNavigate} />;
      case 'mapas_classificacao': return <MapasClassificacaoPage onNavigate={handleNavigate} />;
      case 'pesquisar_fichas_vez': return <PesquisarFichasVezPage onNavigate={handleNavigate} />;
      case 'perfil': return <PerfilPage onNavigate={handleNavigate} />;
      
      case 'equipes': 
        return <EquipesPage 
                    onNavigate={handleNavigate} 
                    historicoOrganizacoes={historicoOrganizacoes} 
                    equipes={equipes}
                    usuarios={usuarios}
                    onDataUpdate={fetchData}
                />;

      case 'usuarios': return <UsuariosPage onNavigate={handleNavigate} />;
      case 'ferias': return <FeriasPage onNavigate={handleNavigate} feriasList={feriasList} setFeriasList={setFeriasList} allUsers={usuarios} />;
      
      case 'formacao_diaria': 
        return <FormacaoDiariaPage 
                    onNavigate={handleNavigate} 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    dailyStatuses={dailyStatuses} 
                    onStatusUpdate={updateMemberStatus} 
                    equipes={equipes} 
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
                    equipes={equipes}
                    dailyGroups={dailyGroups}
                    onGroupsUpdate={updateDailyGroups}
                    historicoOrganizacoes={historicoOrganizacoes}
                    onHistoricoUpdate={setHistoricoOrganizacoes}
                />;
      
      case 'demandas': return <DemandasPage onNavigate={handleNavigate} />;
      case 'atividade_nebulizacao': return <AtividadeNebulizacaoPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={equipes} />;
      case 'atividade_controle_criadouros': return <AtividadeControleCriadourosPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={equipes} />;
      case 'demandas_lider': return <DemandasLiderPage onNavigate={handleNavigate} />;
      case 'view_demanda':
        const demandTeam = equipes.find(e => e.lider.id === selectedDemanda?.responsavel?.id);
        const latestSavedOrganizationForDay = historicoOrganizacoes.filter(org => org.equipe.id === demandTeam?.id && (org.data === selectedDemanda?.prazo || new Date(selectedDemanda!.prazo + 'T00:00:00').toLocaleDateString('pt-BR') === org.data)).sort((a, b) => new Date(b.dataSalvamento).getTime() - new Date(a.dataSalvamento).getTime())[0];
        return <ViewDemandaPage onNavigate={handleNavigate} demanda={selectedDemanda} gruposDoDia={latestSavedOrganizationForDay?.grupos || null} />;
      
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Toaster position="top-right" reverseOrder={false} />
      <Header onToggleSidebar={toggleSidebar} onNavigate={handleNavigate} />
      <Sidebar isOpen={isSidebarOpen} activePage={activePage} onNavigate={handleNavigate} />
      <main className={`min-h-screen transition-[margin-left] duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
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