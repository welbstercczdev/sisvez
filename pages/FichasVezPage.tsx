import React from 'react';
import { 
    HomeIcon, 
    InfoCircleIcon,
    PlusIcon,
    PencilIcon,
    SearchIcon,
    PrinterIcon,
    GlobeIcon,
    FileTextIcon,
    ExportIcon
} from '../components/icons/IconComponents';

interface FichasVezPageProps {
    onNavigate: (page: string) => void;
}

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, onClick }) => (
  <div className="relative bg-white dark:bg-slate-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full border border-slate-200 dark:border-slate-700/50">
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 text-center h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors duration-300">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 dark:text-slate-300" />
      </div>
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{title}</span>
    </button>
  </div>
);


const FichasVezPage: React.FC<FichasVezPageProps> = ({ onNavigate }) => {

    const fichasVezCards = [
        { id: 'inserir', icon: PlusIcon, title: 'Inserir' },
        { id: 'editar', icon: PencilIcon, title: 'Editar' },
        { id: 'pesquisar', icon: SearchIcon, title: 'Pesquisar', onClick: () => onNavigate('pesquisar_fichas_vez') },
        { id: 'imprimir', icon: PrinterIcon, title: 'Imprimir' },
        { id: 'mapas', icon: GlobeIcon, title: 'Mapas', onClick: () => onNavigate('mapas_classificacao') },
        { id: 'relatorios', icon: FileTextIcon, title: 'Relatórios' },
        { id: 'exportar', icon: ExportIcon, title: 'Exportar' },
    ];


  return (
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
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Fichas VEZ</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {fichasVezCards.map(card => (
            <ActionCard 
                key={card.id} 
                icon={card.icon} 
                title={card.title} 
                onClick={card.onClick}
            />
        ))}
      </div>

    </section>
  );
};

export default FichasVezPage;