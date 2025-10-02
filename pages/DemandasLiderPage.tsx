import React from 'react';
import { HomeIcon, EyeIcon, FilterIcon } from '../components/icons/IconComponents';
import { Demanda, User } from '../types';

interface DemandasLiderPageProps {
    onNavigate: (page: string, data?: any) => void;
}

const DUMMY_USERS: User[] = [
    { id: 1, name: 'Ana Silva' },
    { id: 2, name: 'Bruno Costa' },
    { id: 3, name: 'Carla Dias' },
];

const mockDemandas: Demanda[] = [
    { id: 'NEB-101', tipo: 'Nebulização', endereco: 'Rua das Flores, 123 - Vila Industrial', responsavel: DUMMY_USERS[1], status: 'Em Andamento', prazo: '2024-08-15', dataCriacao: '2024-08-01', observacoes: 'Atenção com cão bravo no local.', notificacaoOrigem: 'DP 10537/25' },
    { id: 'CC-205', tipo: 'Controle de Criadouro', endereco: 'Avenida Principal, 456 - Centro', responsavel: DUMMY_USERS[1], status: 'Pendente', prazo: '2024-08-15', dataCriacao: '2024-08-02', observacoes: 'Verificar terreno baldio ao lado.', notificacaoOrigem: 'DP 10540/25' },
    { id: 'NEB-102', tipo: 'Nebulização', endereco: 'Praça Central, S/N - Jardim Satélite', responsavel: DUMMY_USERS[1], status: 'Concluído', prazo: '2024-08-10', dataCriacao: '2024-07-30', observacoes: 'Realizado com sucesso.', notificacaoOrigem: 'DP 10530/25' },
    { id: 'CC-206', tipo: 'Controle de Criadouro', endereco: 'Alameda dos Pássaros, 789 - Bosque dos Eucaliptos', responsavel: DUMMY_USERS[2], status: 'Pendente', prazo: '2024-08-20', dataCriacao: '2024-08-05', observacoes: '', notificacaoOrigem: 'DP 10545/25' },
    { id: 'NEB-103', tipo: 'Nebulização', endereco: 'Rua dos Cravos, 321 - Jardim das Flores', responsavel: DUMMY_USERS[1], status: 'Em Andamento', prazo: '2024-08-18', dataCriacao: '2024-08-06', observacoes: 'Morador solicitou retorno no período da tarde.', notificacaoOrigem: 'DP 10550/25' },
];


const statusStyles: { [key in Demanda['status']]: string } = {
    Pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Em Andamento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Concluído: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};


const DemandasLiderPage: React.FC<DemandasLiderPageProps> = ({ onNavigate }) => {
  
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
                  <span className="ms-1 font-medium text-slate-400 dark:text-slate-500 md:ms-2">Demandas do Líder</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Demandas Atribuídas à Equipe
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                    <FilterIcon className="w-4 h-4" />
                    Filtrar
                </button>
            </div>
            
            {/* Desktop Table */}
            <div className="overflow-x-auto relative hidden md:block">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                            <th scope="col" className="py-3 px-6">ID Demanda</th>
                            <th scope="col" className="py-3 px-6">Tipo</th>
                            <th scope="col" className="py-3 px-6">Endereço</th>
                            <th scope="col" className="py-3 px-6 text-center">Status</th>
                            <th scope="col" className="py-3 px-6 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockDemandas.map((demanda) => (
                            <tr key={demanda.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap dark:text-white">{demanda.notificacaoOrigem}</td>
                                <td className="py-4 px-6">{demanda.tipo}</td>
                                <td className="py-4 px-6">{demanda.endereco}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[demanda.status]}`}>
                                        {demanda.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button onClick={() => onNavigate('view_demanda', demanda)} className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" aria-label={`Visualizar detalhes de ${demanda.notificacaoOrigem}`}>
                                        <EyeIcon className="w-5 h-5 mx-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {mockDemandas.map((demanda) => (
                    <div key={demanda.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">ID Demanda</p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{demanda.notificacaoOrigem}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[demanda.status]}`}>
                                {demanda.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tipo</p>
                            <p className="text-slate-700 dark:text-slate-200">{demanda.tipo}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Endereço</p>
                            <p className="text-slate-700 dark:text-slate-200">{demanda.endereco}</p>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-end">
                             <button onClick={() => onNavigate('view_demanda', demanda)} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 text-sm font-semibold" aria-label={`Visualizar detalhes de ${demanda.notificacaoOrigem}`}>
                                <EyeIcon className="w-5 h-5" />
                                Visualizar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {mockDemandas.length === 0 && <p className="text-center py-4">Nenhuma demanda atribuída à equipe.</p>}
        </div>
      </section>
    </>
  );
};

export default DemandasLiderPage;
