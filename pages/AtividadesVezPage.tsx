import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    HomeIcon, 
    SearchIcon,
    GlobeIcon,
    FileTextIcon,
    ExportIcon,
    ImportIcon,
    SaveIcon
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

// =================================================================================
// ||        FUNÇÃO DE FORMATAÇÃO CORRIGIDA - AGORA 100% BASEADA EM TEXTO          ||
// =================================================================================
/**
 * Converte uma string de data do formato AAAA-MM-DD para DD/MM/AAAA.
 * Opera puramente como manipulação de texto, sem criar objetos Date.
 * @param value O valor a ser formatado.
 * @returns A string formatada ou a string original se não corresponder ao padrão.
 */
const formatDateToDDMMYYYY = (value: string | undefined | null): string => {
    // Garante que temos uma string para trabalhar, e remove espaços em branco.
    const dateString = String(value || '').trim();

    // Expressão regular para capturar AAAA, MM e DD do formato AAAA-MM-DD.
    // ^(\d{4}) - Captura 4 dígitos no início (ano)
    // -       - Literal hyphen
    // (\d{2}) - Captura 2 dígitos (mês)
    // -       - Literal hyphen
    // (\d{2}) - Captura 2 dígitos (dia)
    const yyyy_mm_dd_regex = /^(\d{4})-(\d{2})-(\d{2})/;

    // Verifica se a string corresponde ao padrão
    if (yyyy_mm_dd_regex.test(dateString)) {
        // Se corresponder, reorganiza os grupos capturados para DD/MM/AAAA
        return dateString.replace(yyyy_mm_dd_regex, '$3/$2/$1');
    }

    // Se não corresponder (ex: já é "DD/MM/AAAA", ou é "não informado"), retorna a string original.
    return dateString;
};


const AtividadesVezPage: React.FC<AtividadesVezPageProps> = ({ onNavigate }) => {
    const API_URL = 'https://script.google.com/macros/s/AKfycbyotEdB0INfTNUK9q6MKbHEMQFUzwi5rMYnfZ6tQ7OaQ4ojOa9J3ItXqNsjjEl4XqN0/exec';

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

    const postToAction = async (action: string, payload: any) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ api: 'atividades', action, payload }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || `A ação '${action}' falhou.`);
        return result;
    };

    const handleDataImported = (data: Atividade[]) => {
        if (data.length === 0) {
            toast.error("Nenhum dado válido encontrado no arquivo.");
            return;
        }

        const formattedData = data.map(item => {
            const newItem: Atividade = { ...item };
            newItem.NOTIF_DT = formatDateToDDMMYYYY(item.NOTIF_DT);
            newItem.DT_SINT = formatDateToDDMMYYYY(item.DT_SINT);
            return newItem;
        });

        setImportedData(formattedData);
        toast.success(`${data.length} atividades carregadas para conferência. Clique em "Salvar na Base" para confirmar.`);
    };
    
    const handleSaveToBase = async () => {
        if (importedData.length === 0) {
            toast.error("Não há dados importados para salvar.");
            return;
        }
        const savingToast = toast.loading('Salvando dados na base...');
        try {
            const result = await postToAction('bulkInsert', importedData);
            toast.success(result.message, { id: savingToast });
            setImportedData([]);
        } catch (error: any) {
            toast.error(`Erro ao salvar: ${error.message}`, { id: savingToast });
        }
    };

    const handleViewItem = (item: Atividade) => {
        setSelectedAtividade(item);
        setViewModalOpen(true);
    };

    const handleSearch = async (criteria: SearchCriteria) => {
        const searchToast = toast.loading('Pesquisando...');
        const finalUrl = new URL(API_URL);
        finalUrl.searchParams.append('api', 'atividades');
        if (criteria.name) finalUrl.searchParams.append('name', criteria.name);
        if (criteria.notificationId) finalUrl.searchParams.append('notificationId', criteria.notificationId);
        if (criteria.startDate) finalUrl.searchParams.append('startDate', criteria.startDate);
        if (criteria.endDate) finalUrl.searchParams.append('endDate', criteria.endDate);
        if (criteria.classification) finalUrl.searchParams.append('classification', criteria.classification);

        try {
            const response = await fetch(finalUrl.toString());
            const result = await response.json();
            if (result.success) {
                setSearchResults(result.data);
                setSearchModalOpen(false);
                setSearchResultsModalOpen(true);
                toast.success(`${result.data.length} resultado(s) encontrado(s).`, { id: searchToast });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(`Erro na busca: ${error.message}`, { id: searchToast });
        }
    };
    
    const handleViewFromSearch = (item: Atividade) => {
        setSelectedAtividade(item);
        setViewModalOpen(true);
    };

    const handleEditFromSearch = (item: Atividade) => {
        setSelectedAtividade(item);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedAtividade: Atividade) => {
        const editToast = toast.loading('Atualizando atividade...');
        try {
            const formattedAtividade: Atividade = { ...updatedAtividade };
            formattedAtividade.NOTIF_DT = formatDateToDDMMYYYY(updatedAtividade.NOTIF_DT);
            formattedAtividade.DT_SINT = formatDateToDDMMYYYY(updatedAtividade.DT_SINT);

            const result = await postToAction('update', formattedAtividade);
            
            setSearchResults(prev => prev.map(item => item.ID === formattedAtividade.ID ? formattedAtividade : item));
            
            toast.success(result.message, { id: editToast });
            setEditModalOpen(false);
            setSelectedAtividade(null);
        } catch (error: any) {
            toast.error(`Erro ao atualizar: ${error.message}`, { id: editToast });
        }
    };

    const handleDeleteFromSearch = async (item: Atividade) => {
        toast((t) => (
            <div className="text-center">
                <p>Excluir atividade de <strong>{item.PAC_NOME}</strong>?</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const deleteToast = toast.loading('Excluindo...');
                            try {
                                const result = await postToAction('delete', { id: item.ID });
                                setSearchResults(prev => prev.filter(i => i.ID !== item.ID));
                                toast.success(result.message, { id: deleteToast });
                            } catch (error: any) {
                                toast.error(`Erro ao excluir: ${error.message}`, { id: deleteToast });
                            }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-200 text-slate-800 px-3 py-1 rounded-md text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ));
    };

    const handleGenerateReport = async (criteria: ReportCriteria) => {
        const reportToast = toast.loading('Gerando relatório...');
        const finalUrl = new URL(API_URL);
        finalUrl.searchParams.append('api', 'atividades');
        if (criteria.startDate) finalUrl.searchParams.append('startDate', criteria.startDate);
        if (criteria.endDate) finalUrl.searchParams.append('endDate', criteria.endDate);
        if (criteria.classification) finalUrl.searchParams.append('classification', criteria.classification);

        try {
            const response = await fetch(finalUrl.toString());
            const result = await response.json();
            if (result.success) {
                setReportCriteria(criteria);
                setReportData(result.data);
                setReportModalOpen(false);
                setReportViewModalOpen(true);
                toast.success(`Relatório com ${result.data.length} registros gerado.`, { id: reportToast });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(`Erro ao gerar relatório: ${error.message}`, { id: reportToast });
        }
    };

    const atividadesVezCards = [
        { id: 'importar', icon: ImportIcon, title: 'Importar', onClick: () => setImportModalOpen(true) },
        { id: 'salvar_base', icon: SaveIcon, title: 'Salvar na Base', onClick: handleSaveToBase, disabled: importedData.length === 0 },
        { id: 'pesquisar', icon: SearchIcon, title: 'Pesquisar', onClick: () => setSearchModalOpen(true) },
        { id: 'mapas', icon: GlobeIcon, title: 'Mapas' },
        { id: 'relatorios', icon: FileTextIcon, title: 'Relatórios', onClick: () => setReportModalOpen(true) },
        { id: 'exportar', icon: ExportIcon, title: 'Exportar' },
    ];

    return (
        <>
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-700 dark:text-slate-100' }} />
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
                  <ActionCard key={card.id} icon={card.icon} title={card.title} onClick={card.onClick} disabled={card.disabled} />
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
          
          {/* Modais */}
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
                apiUrl={API_URL}
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