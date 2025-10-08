import React, { useState, useEffect } from 'react';
// 1. IMPORTAR A BIBLIOTECA DE TOASTS
import toast, { Toaster } from 'react-hot-toast';
import { 
    HomeIcon, 
    ImportIcon,
    SearchIcon,
    ExportIcon,
    SaveIcon
} from '../components/icons/IconComponents';
import { Agrupamento } from '../types';
import ImportAgrupamentosModal from '../components/ImportAgrupamentosModal';
import AgrupamentosDataTable from '../components/AgrupamentosDataTable';
import ViewAgrupamentoModal from '../components/ViewAgrupamentoModal';
import SearchAgrupamentosModal, { SearchAgrupamentosCriteria } from '../components/SearchAgrupamentosModal';

// ... (O componente ActionCard permanece exatamente o mesmo)
interface AgrupamentosPageProps {
    onNavigate: (page: string) => void;
}

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, onClick, disabled }) => (
  <div className="relative bg-white dark:bg-slate-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full border border-slate-200 dark:border-slate-700/50">
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center justify-center p-6 text-center h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors duration-300">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 dark:text-slate-300" />
      </div>
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{title}</span>
    </button>
  </div>
);


const AgrupamentosPage: React.FC<AgrupamentosPageProps> = ({ onNavigate }) => {
    const API_URL = 'https://script.google.com/macros/s/AKfycbxydZRITveayyGKhY4ZPOfxXbMKEvW2c7yS81PMOHU68JbBVxqDNyRHpzq9HWj_17Sf/exec';

    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedAgrupamento, setSelectedAgrupamento] = useState<Agrupamento | null>(null);
    const [tableData, setTableData] = useState<Agrupamento[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    useEffect(() => {
        setSelectedRows([]);
    }, [tableData]);

    const handleDataImported = (data: Agrupamento[]) => {
        setTableData(data);
    };

    const handleViewItem = (item: Agrupamento) => {
        setSelectedAgrupamento(item);
        setViewModalOpen(true);
    };

    // 3. SUBSTITUIR OS ALERTS POR TOASTS
    const handleSearch = async (criteria: SearchAgrupamentosCriteria) => {
        const searchingToast = toast.loading('Pesquisando...'); // Mostra um toast de carregamento
        const finalUrl = new URL(API_URL);
        if (criteria.nome) finalUrl.searchParams.append('nome', criteria.nome);
        if (criteria.regiao) finalUrl.searchParams.append('regiao', criteria.regiao);
        if (criteria.startDate) finalUrl.searchParams.append('startDate', criteria.startDate);
        if (criteria.endDate) finalUrl.searchParams.append('endDate', criteria.endDate);

        try {
            const response = await fetch(finalUrl.toString());
            const result = await response.json();
            if (result.success) {
                setTableData(result.data);
                toast.success(`${result.data.length} registro(s) encontrado(s).`, { id: searchingToast }); // Atualiza o toast para sucesso
            } else { 
                throw new Error(result.error || "Falha ao buscar dados."); 
            }
        } catch (error: any) {
            toast.error(`Erro ao buscar dados: ${error.message}`, { id: searchingToast }); // Atualiza o toast para erro
        } finally {
            setSearchModalOpen(false);
        }
    };

    const handleExport = () => {
        if (selectedRows.length === 0) {
            toast.error("Nenhum agrupamento selecionado para exportar."); // SUBSTITUÍDO
            return;
        }
        const dataToExport = tableData.filter(item => selectedRows.includes(item.nome));
        const headers = ["nome", "data", "totalNotificacoes", "dengueConfirmado", "dengueMuitoProvavel", "chikungunyaConfirmado", "chikungunyaMuitoProvavel", "pontuacaoTotal", "regiao", "area", "latitude", "longitude"];
        const escapeCsvValue = (value: any) => String(value ?? '').trim().replace(/"/g, '""');
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(item => headers.map(header => `"${escapeCsvValue(item[header as keyof Agrupamento])}"`).join(','))
        ].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `agrupamentos_selecionados.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${dataToExport.length} agrupamento(s) exportado(s)!`); // NOVO TOAST
    };

    const handleSaveToBase = async () => {
        if (tableData.length === 0) {
            // Este alerta pode ser mantido ou trocado por um toast.error
            toast.error("Não há dados na tabela para salvar.");
            return;
        }
        
        // Usando o toast para confirmação (mais avançado)
        toast((t) => (
            <div className="flex flex-col gap-3 text-center">
                <p className="font-semibold">Deseja salvar {tableData.length} agrupamento(s) na base?</p>
                <small>Registros com nomes duplicados serão ignorados.</small>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const savingToast = toast.loading('Salvando na base...');
                            try {
                                const response = await fetch(API_URL, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                    body: JSON.stringify(tableData),
                                });
                                const result = await response.json();
                                if (result.success) {
                                    toast.success(result.data.message, { id: savingToast });
                                    setTableData([]);
                                } else { 
                                    throw new Error(result.error || "Erro desconhecido ao salvar."); 
                                }
                            } catch (error: any) {
                                toast.error(`Erro ao salvar: ${error.message}`, { id: savingToast });
                            }
                        }}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 }); // O toast de confirmação some após 6 segundos
    };

    const actionCards: (ActionCardProps & { id: string })[] = [
        { id: 'importar', icon: ImportIcon, title: 'Importar', onClick: () => setImportModalOpen(true) },
        { id: 'pesquisar', icon: SearchIcon, title: 'Pesquisar', onClick: () => setSearchModalOpen(true) },
        { id: 'exportar', icon: ExportIcon, title: 'Exportar Seleção', onClick: handleExport, disabled: selectedRows.length === 0 },
        { id: 'salvar_base', icon: SaveIcon, title: 'Salvar na Base', onClick: handleSaveToBase, disabled: tableData.length === 0 },
    ];

  return (
    <>
      {/* 2. ADICIONAR O COMPONENTE <Toaster /> AQUI */}
      <Toaster 
        position="top-right"
        toastOptions={{
            // Estilos para modo escuro e claro
            className: 'dark:bg-slate-700 dark:text-slate-100',
            duration: 4000,
        }}
      />
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
                  <span className="ms-1 font-medium text-slate-500 dark:text-slate-400 md:ms-2">Arboviroses</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Agrupamentos</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {actionCards.map(card => (
              <ActionCard 
                  key={card.id} 
                  icon={card.icon} 
                  title={card.title} 
                  onClick={card.onClick}
                  disabled={card.disabled}
              />
          ))}
        </div>

        {tableData.length > 0 && (
            <AgrupamentosDataTable 
                data={tableData} 
                setData={setTableData}
                onViewItem={handleViewItem}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
            />
        )}
      </section>

      {/* Os modais não precisam ser alterados */}
      <ImportAgrupamentosModal 
          isOpen={isImportModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={handleDataImported}
      />
      <SearchAgrupamentosModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSearch={handleSearch}
      />
      <ViewAgrupamentoModal 
        isOpen={isViewModalOpen}
        onClose={() => { setViewModalOpen(false); setSelectedAgrupamento(null); }}
        agrupamento={selectedAgrupamento}
      />
    </>
  );
};

export default AgrupamentosPage;