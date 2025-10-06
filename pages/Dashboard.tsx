import React from 'react';
import { HomeIcon, InfoCircleIcon, WindowIcon, FileTextIcon, PersonWalkingIcon } from '../components/icons/IconComponents';

interface CardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
  glow: string;
  lightColor: string;
  lightIconColor: string;
}

const InfoCard: React.FC<CardProps> = ({ icon: Icon, title, description, onClick, gradient, glow, lightColor, lightIconColor }) => (
  <div className={`shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 h-full flex flex-col relative group rounded-xl overflow-hidden bg-white dark:bg-transparent ${lightColor} dark:${gradient} dark:${glow}`}>
    <div className="absolute top-2 right-2 z-10">
      <div className="relative group">
        <button type="button" aria-label={`More info about ${title}`} className="p-1 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 rounded-full">
          <InfoCircleIcon className="w-5 h-5 text-slate-400 dark:text-white/70" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-64 origin-bottom-right bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg opacity-0 scale-95 transform transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none">
          {description}
        </div>
      </div>
    </div>
    <button onClick={onClick} className="flex flex-col items-center justify-center text-center p-6 flex-grow pt-8 transition-transform duration-300 group-hover:-translate-y-1 w-full">
      {/* Dark Mode Icon */}
      <div className="hidden dark:flex w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center mb-5 border border-white/20">
        <Icon className="w-10 h-10 text-white" />
      </div>
      {/* Light Mode Icon */}
      <div className="flex dark:hidden w-20 h-20 rounded-full bg-slate-100 items-center justify-center mb-5">
        <Icon className={`w-10 h-10 ${lightIconColor}`} />
      </div>
      <span className="font-semibold text-lg text-slate-800 dark:text-white">{title}</span>
    </button>
  </div>
);

interface DashboardProps {
    onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    {
      icon: FileTextIcon,
      title: 'Fichas VEZ',
      description: 'Dados relacionados as notificações do SINAN selecionadas pela VEZ para realização de atividades de campo',
      onClick: () => onNavigate('fichas_vez'),
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
      glow: 'hover:shadow-[0_0_25px_5px_rgba(251,191,36,0.4)]',
      lightColor: 'border-t-4 border-amber-500',
      lightIconColor: 'text-amber-500',
    },
  ];

  return (
    <section className="space-y-6 pb-8">
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
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Painéis</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title}>
            <InfoCard {...card} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;