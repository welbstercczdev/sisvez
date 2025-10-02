import React, { useState } from 'react';
import { 
    HomeIcon, 
    PlusIcon,
} from '../components/icons/IconComponents';
import SelectNotificationModal from '../components/SelectNotificationModal';
import { Atividade } from '../types';

interface DemandasPageProps {
    onNavigate: (page: string, data?: any) => void;
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


const DemandasPage: React.FC<DemandasPageProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('controle');
    const [isSelectModalOpen, setSelectModalOpen] = useState(false);
    const [demandaType, setDemandaType] = useState<'Controle de Criadouro' | 'Nebulização'>('Controle de Criadouro');

    const handleOpenModal = (type: 'Controle de Criadouro' | 'Nebulização') => {
        setDemandaType(type);
        setSelectModalOpen(true);
    };

    const handleNotificationSelected = (notification: Atividade) => {
        setSelectModalOpen(false);
        const targetPage = demandaType === 'Controle de Criadouro' 
            ? 'atividade_controle_criadouros' 
            : 'atividade_nebulizacao';
        onNavigate(targetPage, notification);
    };

    const controleCards = [
        { id: 'inserir_controle', icon: PlusIcon, title: 'Inserir', onClick: () => handleOpenModal('Controle de Criadouro') },
    ];

    const nebulizacaoCards = [
        { id: 'inserir_neb', icon: PlusIcon, title: 'Inserir', onClick: () => handleOpenModal('Nebulização') },
    ];

    const cardsToDisplay = activeTab === 'controle' ? controleCards : nebulizacaoCards;

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
                  <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Demandas</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button 
                  onClick={() => setActiveTab('controle')}
                  className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                      activeTab === 'controle' 
                      ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                    Controle de Criadouros
                </button>
                <button 
                  onClick={() => setActiveTab('nebulizacao')}
                  className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                      activeTab === 'nebulizacao' 
                      ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                    Nebulização
                </button>
            </nav>
        </div>


        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {cardsToDisplay.map(card => (
              <ActionCard 
                  key={card.id} 
                  icon={card.icon} 
                  title={card.title} 
                  onClick={card.onClick}
              />
          ))}
        </div>
      </section>

      <SelectNotificationModal 
          isOpen={isSelectModalOpen}
          onClose={() => setSelectModalOpen(false)}
          onSelect={handleNotificationSelected}
          demandaType={demandaType}
      />
    </>
  );
};

export default DemandasPage;