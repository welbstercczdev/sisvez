
import React from 'react';
import { 
    HomeIcon, 
    InfoCircleIcon, 
    FileTextIcon,
    CrossIcon,
    BuildingIcon,
    BuildingsIcon,
    LineChartIcon,
    ComputerIcon,
    ClusterIcon,
    GridIcon
} from '../components/icons/IconComponents';

interface SinanPageProps {
    onNavigate: (page: string) => void;
}

interface SinanCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const SinanCard: React.FC<SinanCardProps> = ({ icon: Icon, title, description }) => (
  <div className="relative bg-white dark:bg-slate-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full border border-slate-200 dark:border-slate-700/50">
    <div className="absolute top-2 right-2 z-10">
        <div className="relative group">
            <button type="button" aria-label={`More info about ${title}`} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full">
                <InfoCircleIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-60 origin-bottom-right bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg opacity-0 scale-95 transform transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none">
                {description}
            </div>
        </div>
    </div>
    <button className="flex flex-col items-center justify-center p-6 text-center h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-lg">
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors duration-300">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 dark:text-slate-300" />
      </div>
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{title}</span>
    </button>
  </div>
);


const SinanPage: React.FC<SinanPageProps> = ({ onNavigate }) => {

    const sinanCards = [
        { id: 'notificacoes', icon: FileTextIcon, title: 'Notificações', description: 'Visualizar e gerenciar notificações de agravos.' },
        { id: 'obitos', icon: CrossIcon, title: 'Óbitos', description: 'Painel de monitoramento de óbitos.' },
        { id: 'bairros', icon: BuildingIcon, title: 'Confirmadas por Bairros/SE', description: 'Casos confirmados distribuídos por bairros.' },
        { id: 'ubs', icon: BuildingsIcon, title: 'Confirmadas por Abrangência UBS/SE', description: 'Casos confirmados na área de abrangência das Unidades Básicas de Saúde.' },
        { id: 'controle', icon: LineChartIcon, title: 'Diagrama de Controle', description: 'Gráficos de controle para acompanhamento de tendências.' },
        { id: 'situacao', icon: ComputerIcon, title: 'Sala de Situação', description: 'Painel consolidado com dados em tempo real.' },
        { id: 'agrupamento', icon: ClusterIcon, title: 'Agrupamento', description: 'Análise de agrupamentos de casos.' },
        { id: 'atividade_agrupamento', icon: GridIcon, title: 'Atividade Agrupamento', description: 'Monitoramento de atividades em áreas de agrupamento.' },
        { id: 'controle_total', icon: LineChartIcon, title: 'Diagrama de Controle Por Total de Notificações', description: 'Gráfico de controle baseado no número total de notificações.' },
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
             <li>
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <button onClick={() => onNavigate('dashboard')} className="ms-1 font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200 md:ms-2">Painéis</button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Sinan</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {sinanCards.map(card => (
            <SinanCard key={card.id} icon={card.icon} title={card.title} description={card.description} />
        ))}
      </div>

    </section>
  );
};

export default SinanPage;
