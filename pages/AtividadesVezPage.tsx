import React, { useState } from 'react';
import { 
    HomeIcon, 
    SearchIcon,
    GlobeIcon,
    FileTextIcon,
    ExportIcon,
    ImportIcon
} from '../components/icons/IconComponents';
import ImportModal from '../components/ImportModal';
import SearchAtividadeModal from '../components/SearchAtividadeModal';
import ImportedDataTable from '../components/ImportedDataTable';
import ViewAtividadeModal from '../components/ViewAtividadeModal';
import SearchResultsModal from '../components/SearchResultsModal';
import ReportModal from '../components/ReportModal';
import ReportViewModal from '../components/ReportViewModal';
import EditAtividadeModal from '../components/EditAtividadeModal';
import { Atividade } from '../types';
import { ReportCriteria } from '../components/ReportModal';


interface SearchCriteria {
    name: string;
    notificationId: string;
    startDate: string;
    endDate: string;
    classification: string;
}

interface AtividadesVezPageProps {
    onNavigate: (page: string) => void;
}

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, onClick }) => (
  <div className="relative bg-white dark:bg-slate-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full border border-slate-200 dark:border-slate-700/50">
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 text-center h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-lg">
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors duration-300">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 dark:text-slate-300" />
      </div>
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{title}</span>
    </button>
  </div>
);


const AtividadesVezPage: React.FC<AtividadesVezPageProps> = ({ onNavigate }) => {
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isSearchResultsModalOpen, setSearchResultsModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isReportViewModalOpen, setReportViewModalOpen] = useState(false);
    
    const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
    const [importedData, setImportedData] = useState<Atividade[]>([]);
    const [searchResults, setSearchResults] = useState<Atividade[]>([]);
    const [reportData, setReportData] = useState<Atividade[]>([]);
    const [reportCriteria, setReportCriteria] = useState<ReportCriteria | null>(null);


    const handleDataImported = (data: Atividade[]) => {
        console.log("CSV Data Imported:", data);
        setImportedData(data);
    };
    
    const handleViewItem = (item: Atividade) => {
        setSelectedAtividade(item);
        setViewModalOpen(true);
    };


    const handleSearch = (criteria: SearchCriteria) => {
        console.log("Search Criteria:", criteria);
        // In a real app, you would fetch data here.
        // For now, we use dummy data to demonstrate the results modal.
        const dummyResults: Atividade[] = [
            { ID: '2001', AGRAVO: 'DENGUE', ANO: '2023', NOTIF_DT: '2023-05-10', PAC_NOME: 'ANA SILVA', DT_SINT: '2023-05-08', PAC_LOGR: 'AVENIDA CENTRAL', PAC_NUM: '100', PAC_BAIR: 'CENTRO', PAC_REG: 'SUL', PAC_CDD: 'SAO JOSE DOS CAMPOS', CLASSIF: 'Confirmado', isAgrupamento: true, agrupamentoNome: 'AG-CENTRO-2023-SE01' },
            { ID: '2002', AGRAVO: 'CHIKUNGUNYA', ANO: '2023', NOTIF_DT: '2023-05-12', PAC_NOME: 'JOÃO COSTA', DT_SINT: '2023-05-10', PAC_LOGR: 'RUA DAS FLORES', PAC_NUM: '25', PAC_BAIR: 'JARDIM SATELITE', PAC_REG: 'SUL', PAC_CDD: 'SAO JOSE DOS CAMPOS', CLASSIF: 'Suspeito', isAgrupamento: false },
        ];
        setSearchResults(dummyResults);
        setSearchModalOpen(false);
        setSearchResultsModalOpen(true);
    };
    
    const handleViewFromSearch = (item: Atividade) => {
        setSelectedAtividade(item);
        setViewModalOpen(true);
    };

    const handleEditFromSearch = (item: Atividade) => {
        setSelectedAtividade(item);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (updatedAtividade: Atividade) => {
        console.log("Saving edited data:", updatedAtividade);
        setSearchResults(prev => prev.map(item => item.ID === updatedAtividade.ID ? updatedAtividade : item));
        setEditModalOpen(false);
        setSelectedAtividade(null);
        alert(`Atividade de ${updatedAtividade.PAC_NOME} atualizada.`);
    };


    const handleDeleteFromSearch = (item: Atividade) => {
        if (window.confirm(`Tem certeza que deseja excluir a atividade de ${item.PAC_NOME}?`)) {
            console.log("Deleting item:", item);
            setSearchResults(prev => prev.filter(i => i.ID !== item.ID));
            alert(`Atividade de ${item.PAC_NOME} excluída.`);
        }
    };

    const handleGenerateReport = (criteria: ReportCriteria) => {
        console.log("Generating report with criteria:", criteria);
        
        // Simulate fetching report data based on criteria
        const dummyReportData: Atividade[] = [
            { ID: '3015', AGRAVO: 'DENGUE', ANO: '2023', NOTIF_DT: '2023-07-20', PAC_NOME: 'MARIA OLIVEIRA', DT_SINT: '2023-07-18', PAC_LOGR: 'RUA DAS ACÁCIAS', PAC_NUM: '300', PAC_BAIR: 'BOSQUE DOS EUCALIPTOS', PAC_REG: 'SUL', PAC_CDD: 'SAO JOSE DOS CAMPOS', CLASSIF: 'Confirmado' },
            { ID: '3016', AGRAVO: 'DENGUE', ANO: '2023', NOTIF_DT: '2023-07-21', PAC_NOME: 'CARLOS PEREIRA', DT_SINT: '2023-07-19', PAC_LOGR: 'AVENIDA BRASIL', PAC_NUM: '1500', PAC_BAIR: 'VILA EMA', PAC_REG: 'CENTRO', PAC_CDD: 'SAO JOSE DOS CAMPOS', CLASSIF: 'Suspeito' },
            { ID: '3017', AGRAVO: 'CHIKUNGUNYA', ANO: '2023', NOTIF_DT: '2023-07-22', PAC_NOME: 'FERNANDA SOUZA', DT_SINT: '2023-07-20', PAC_LOGR: 'PRAÇA DA SÉ', PAC_NUM: 'S/N', PAC_BAIR: 'CENTRO', PAC_REG: 'CENTRO', PAC_CDD: 'SAO JOSE DOS CAMPOS', CLASSIF: 'Descartado' },
        ];
        
        setReportCriteria(criteria);
        setReportData(dummyReportData);
        setReportModalOpen(false);
        setReportViewModalOpen(true);
    };


    const atividadesVezCards = [
        { id: 'importar', icon: ImportIcon, title: 'Importar', onClick: () => setImportModalOpen(true) },
        { id: 'pesquisar', icon: SearchIcon, title: 'Pesquisar', onClick: () => setSearchModalOpen(true) },
        { id: 'mapas', icon: GlobeIcon, title: 'Mapas' },
        { id: 'relatorios', icon: FileTextIcon, title: 'Relatórios', onClick: () => setReportModalOpen(true) },
        { id: 'exportar', icon: ExportIcon, title: 'Exportar' },
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
                  <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Atividades VEZ</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {atividadesVezCards.map(card => (
              <ActionCard key={card.id} icon={card.icon} title={card.title} onClick={card.onClick} />
          ))}
        </div>
        
        {importedData.length > 0 && (
            <ImportedDataTable 
                data={importedData} 
                setData={setImportedData}
                onViewItem={handleViewItem}
            />
        )}

      </section>
      <ImportModal 
          isOpen={isImportModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={handleDataImported}
      />
      <SearchAtividadeModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSearch={handleSearch}
      />
       <ViewAtividadeModal
          isOpen={isViewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedAtividade(null); }}
          atividade={selectedAtividade}
      />
      <SearchResultsModal
          isOpen={isSearchResultsModalOpen}
          onClose={() => setSearchResultsModalOpen(false)}
          results={searchResults}
          onView={handleViewFromSearch}
          onEdit={handleEditFromSearch}
          onDelete={handleDeleteFromSearch}
      />
       <EditAtividadeModal
            isOpen={isEditModalOpen}
            onClose={() => { setEditModalOpen(false); setSelectedAtividade(null); }}
            onSave={handleSaveEdit}
            atividade={selectedAtividade}
        />
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
       <ReportViewModal 
        isOpen={isReportViewModalOpen}
        onClose={() => { setReportViewModalOpen(false); setReportData([]); setReportCriteria(null); }}
        criteria={reportCriteria}
        data={reportData}
      />
    </>
  );
};

export default AtividadesVezPage;