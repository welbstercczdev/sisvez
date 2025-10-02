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

// URL do seu Backend no Google Apps Script
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7Kc1gsYIj9MmB_kXG8pAZk4_rphYfNP-I84pNwYbDXcvuJcBG9G3XCoDRBwLw1RMA/exec';

// Função auxiliar para renomear grupos dinamicamente
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

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [feriasList, setFeriasList] = useState<Ferias[]>([]);
  const [historicoOrganizacoes, setHistoricoOrganizacoes] = useState<OrganizacaoSalva[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStatuses, setDailyStatuses] = useState<Map<number, MembroComStatus>>(new Map());
  const [dailyGroups, setDailyGroups] = useState<Map<string, Grupo[]>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // PASSO 1: Dispara todas as requisições e aguarda as 'respostas' (sem ler o corpo ainda)
            const [
                usersResponse,
                equipesResponse,
                feriasResponse,
                orgsResponse
            ] = await Promise.all([
                fetch(`${WEB_APP_URL}?action=getUsers`),
                fetch(`${WEB_APP_URL}?action=getEquipes`),
                fetch(`${WEB_APP_URL}?action=getFerias`),
                fetch(`${WEB_APP_URL}?action=getOrganizacoes`)
            ]);

            // PASSO 2: Lê o corpo JSON de todas as respostas. Usamos 'any' para garantir que não haverá erro de compilação.
            const [
                usersData,
                equipesData,
                feriasData,
                orgsData
            ] = await Promise.all([
                usersResponse.json(),
                equipesResponse.json(),
                feriasResponse.json(),
                orgsResponse.json()
            ]) as [any, any, any, any];

            // PASSO 3: Valida em tempo de execução se os dados são arrays antes de usar
            if (Array.isArray(usersData)) setUsers(usersData);
            else console.error("Erro na API: A resposta para 'usuários' não foi um array.", usersData);

            if (Array.isArray(equipesData)) setEquipes(equipesData);
            else console.error("Erro na API: A resposta para 'equipes' não foi um array.", equipesData);

            if (Array.isArray(feriasData)) setFeriasList(feriasData);
            else console.error("Erro na API: A resposta para 'férias' não foi um array.", feriasData);

            if (Array.isArray(orgsData)) setHistoricoOrganizacoes(orgsData);
            else console.error("Erro na API: A resposta para 'organizações' não foi um array.", orgsData);

        } catch (error) {
            console.error("Falha ao buscar dados:", error);
            alert("Não foi possível carregar os dados do servidor. Verifique a conexão e tente recarregar a página.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading || users.length === 0) return; 

    const newStatuses = new Map<number, MembroComStatus>();
    const currentDateObj = new Date(currentDate + 'T00:00:00');

    users.forEach(user => {
        const activeVacation = feriasList.find(f => {
            if (!f.funcionario) return false; // Adiciona guarda contra dados incompletos da API
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
    setDailyGroups(new Map());
    
  }, [currentDate, feriasList, users, isLoading]);


  const handleSaveOrganization = async (newOrgData: Omit<OrganizacaoSalva, 'id' | 'dataSalvamento' | 'usuarioSalvo'> & { usuarioSalvoId: number }) => {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=addOrganizacao`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(newOrgData)
        });
        
        const result: any = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }
        
        if(result.success && result.data) {
            setHistoricoOrganizacoes(prev => [...prev, result.data]);
            alert('Organização salva com sucesso!');
        } else {
            throw new Error('A resposta da API ao salvar foi inválida.');
        }

    } catch (error) {
        console.error('Falha ao salvar organização:', error);
        alert(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const updateDailyGroups = (teamId: string, newGroups: Grupo[]) => {
      setDailyGroups(prev => new Map(prev).set(teamId, newGroups));
  };

  const updateMemberStatus = (memberId: number, status: MembroStatus, observacao?: string) => {
    const currentMemberStatus = dailyStatuses.get(memberId);
    if (currentMemberStatus?.status === 'Férias' && status !== 'Férias') {
        alert('Não é possível alterar o status de um funcionário que está de férias.');
        return;
    }

    setDailyStatuses(prev => {
        const newStatuses = new Map(prev);
        const member = users.find(u => u.id === memberId);
        if (member) {
            newStatuses.set(memberId, { ...member, status, observacao: status === 'Observação' ? observacao : undefined });
        }
        return newStatuses;
    });

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
      if (window.innerWidth < 1200) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
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
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl">Carregando dados...</p></div>;
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
      case 'equipes': return <EquipesPage onNavigate={handleNavigate} historicoOrganizacoes={historicoOrganizacoes} />;
      case 'ferias': return <FeriasPage onNavigate={handleNavigate} feriasList={feriasList} setFeriasList={setFeriasList} allUsers={users} />;
      case 'formacao_diaria':
        return <FormacaoDiariaPage onNavigate={handleNavigate} currentDate={currentDate} setCurrentDate={setCurrentDate} dailyStatuses={dailyStatuses} onStatusUpdate={updateMemberStatus} equipes={equipes} dailyGroups={dailyGroups} historicoOrganizacoes={historicoOrganizacoes} />;
      case 'organizar_equipes':
        return <OrganizarEquipesPage onNavigate={handleNavigate} currentDate={currentDate} setCurrentDate={setCurrentDate} dailyStatuses={dailyStatuses} onStatusUpdate={updateMemberStatus} equipes={equipes} dailyGroups={dailyGroups} onGroupsUpdate={updateDailyGroups} historicoOrganizacoes={historicoOrganizacoes} onHistoricoUpdate={handleSaveOrganization} />;
      case 'demandas': return <DemandasPage onNavigate={handleNavigate} />;
      case 'atividade_nebulizacao': return <AtividadeNebulizacaoPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={equipes} />;
      case 'atividade_controle_criadouros': return <AtividadeControleCriadourosPage onNavigate={handleNavigate} notification={notificationForDemanda} equipes={equipes} />;
      case 'demandas_lider': return <DemandasLiderPage onNavigate={handleNavigate} />;
      case 'view_demanda':
        const demandTeam = equipes.find(e => e.lider && selectedDemanda?.responsavel && e.lider.id === selectedDemanda.responsavel.id);
        const latestSavedOrganizationForDay = historicoOrganizacoes
            .filter(org => org.equipe && demandTeam && org.equipe.id === demandTeam.id && org.data === selectedDemanda?.prazo)
            .sort((a, b) => new Date(b.dataSalvamento).getTime() - new Date(a.dataSalvamento).getTime())[0];
        return <ViewDemandaPage onNavigate={handleNavigate} demanda={selectedDemanda} gruposDoDia={latestSavedOrganizationForDay?.grupos || null} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
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