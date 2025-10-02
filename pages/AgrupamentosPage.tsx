import React, { useState } from 'react';
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
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedAgrupamento, setSelectedAgrupamento] = useState<Agrupamento | null>(null);
    const [tableData, setTableData] = useState<Agrupamento[]>([]);

    const handleDataImported = (data: Agrupamento[]) => {
        setTableData(data);
    };

    const handleViewItem = (item: Agrupamento) => {
        setSelectedAgrupamento(item);
        setViewModalOpen(true);
    };

    const handleSearch = (criteria: SearchAgrupamentosCriteria) => {
        console.log("Searching with criteria:", criteria);
        // In a real app, you would filter or fetch data.
        // For demonstration, we'll return some dummy data.
        const dummyResults: Agrupamento[] = [
            { nome: 'AG-JD-AMERICA-2023-SE34', data: '22/08/2023', totalNotificacoes: 15, dengueConfirmado: 5, dengueMuitoProvavel: 8, chikungunyaConfirmado: 0, chikungunyaMuitoProvavel: 0, pontuacaoTotal: 29, regiao: 'Sul', area: 150000, latitude: '-23.218', longitude: '-45.912' },
            { nome: 'AG-VILA-INDUSTRIAL-2023-SE41', data: '25/08/2023', totalNotificacoes: 22, dengueConfirmado: 10, dengueMuitoProvavel: 10, chikungunyaConfirmado: 1, chikungunyaMuitoProvavel: 1, pontuacaoTotal: 52, regiao: 'Leste', area: 210000, latitude: '-23.185', longitude: '-45.861' }
        ];
        setTableData(dummyResults);
        setSearchModalOpen(false); // Close modal after search
    };

    const handleExport = () => {
        if (tableData.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        const headers = [
            "Nome", "Data", "Total Notificacoes", "Dengue Confirmado", 
            "Dengue Muito Provavel", "Chikungunya Confirmado", 
            "Chikungunya Muito Provavel", "Pontuacao Total", "Regiao", 
            "Area (m2)", "Latitude", "Longitude"
        ];
        
        const escapeCsvValue = (value: any): string => {
            const stringValue = String(value ?? '').trim();
            if (/[",\n]/.test(stringValue)) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };
        
        const csvContent = [
            headers.join(','),
            ...tableData.map(item => [
                escapeCsvValue(item.nome),
                escapeCsvValue(item.data),
                escapeCsvValue(item.totalNotificacoes),
                escapeCsvValue(item.dengueConfirmado),
                escapeCsvValue(item.dengueMuitoProvavel),
                escapeCsvValue(item.chikungunyaConfirmado),
                escapeCsvValue(item.chikungunyaMuitoProvavel),
                escapeCsvValue(item.pontuacaoTotal),
                escapeCsvValue(item.regiao),
                escapeCsvValue(item.area),
                escapeCsvValue(item.latitude),
                escapeCsvValue(item.longitude),
            ].join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "agrupamentos.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveToBase = () => {
        if (tableData.length === 0) {
            alert("Não há dados para salvar.");
            return;
        }

        if (window.confirm(`Tem certeza que deseja salvar ${tableData.length} agrupamento(s) na base? Esta ação limpará a tabela atual.`)) {
            // Simulate API call
            console.log("Salvando na base de dados:", tableData);
            
            // Show success message
            alert("Agrupamentos salvos com sucesso!");

            // Clear the table data
            setTableData([]);
        }
    };

    const actionCards: (ActionCardProps & { id: string })[] = [
        { id: 'importar', icon: ImportIcon, title: 'Importar', onClick: () => setImportModalOpen(true) },
        { id: 'pesquisar', icon: SearchIcon, title: 'Pesquisar', onClick: () => setSearchModalOpen(true) },
        { id: 'exportar', icon: ExportIcon, title: 'Exportar', onClick: handleExport, disabled: tableData.length === 0 },
        { id: 'salvar_base', icon: SaveIcon, title: 'Salvar na Base', onClick: handleSaveToBase, disabled: tableData.length === 0 },
    ];


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
            />
        )}
      </section>

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