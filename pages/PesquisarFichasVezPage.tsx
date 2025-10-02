import React, { useState } from 'react';
import { HomeIcon, FilterIcon } from '../components/icons/IconComponents';

interface PesquisarFichasVezPageProps {
    onNavigate: (page: string) => void;
}

interface ToggleSwitchProps {
    id: string;
    name: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, name, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
            <input 
                type="radio" 
                id={id} 
                name={name} 
                value={id}
                className="sr-only" 
                checked={checked}
                onChange={onChange}
            />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-sm text-slate-600 dark:text-slate-300">{label}</div>
    </label>
);


const PesquisarFichasVezPage: React.FC<PesquisarFichasVezPageProps> = ({ onNavigate }) => {
    const [searchType, setSearchType] = useState('vez');

    const handleSearchTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchType(e.target.value);
    };


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
                 <button onClick={() => onNavigate('fichas_vez')} className="ms-1 font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors duration-200 md:ms-2">Fichas VEZ</button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 dark:text-slate-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Pesquisar</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Filter Card */}
      <div className="relative bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="absolute top-4 right-4">
              <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition" aria-label="Filter options">
                  <FilterIcon className="w-5 h-5" />
              </button>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                      <label htmlFor="agravo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agravo</label>
                      <input type="text" id="agravo" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                  </div>
                  <div>
                      <label htmlFor="filtrar_por" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filtrar por</label>
                      <select id="filtrar_por" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                          <option></option>
                      </select>
                  </div>
                  <div>
                      <label htmlFor="ano" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano</label>
                      <select id="ano" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                          <option></option>
                      </select>
                  </div>
                   <div>
                      <label htmlFor="filtro_data" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filtro Data</label>
                      <select id="filtro_data" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                          <option></option>
                      </select>
                  </div>
                  <div>
                      <label htmlFor="data_inicial" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Inicial</label>
                      <input type="date" id="data_inicial" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                  </div>
                  <div>
                      <label htmlFor="data_final" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Final</label>
                      <input type="date" id="data_final" className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500" />
                  </div>
              </div>
              
              <div className="mt-6 pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                   <ToggleSwitch
                      id="vez"
                      name="searchType"
                      label="Pesquisar por N° VEZ"
                      checked={searchType === 'vez'}
                      onChange={handleSearchTypeChange}
                  />
                  <ToggleSwitch
                      id="nome"
                      name="searchType"
                      label="Pesquisar por Nome"
                      checked={searchType === 'nome'}
                      onChange={handleSearchTypeChange}
                  />
              </div>

               <div className="mt-8 flex justify-end">
                  <button type="submit" className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900">
                      Aplicar
                  </button>
              </div>
          </form>
      </div>

    </section>
  );
};

export default PesquisarFichasVezPage;