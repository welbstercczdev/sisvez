import React, { useState, useEffect } from 'react';
import { NavItem } from '../types';
import { FireIcon, ContactsBookIcon, MapIcon, ComputerIcon, ChevronDownIcon } from './icons/IconComponents';

interface SidebarProps {
  isOpen: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems: NavItem[] = [
  {
    id: 'arboviroses',
    title: 'Arboviroses',
    icon: FireIcon,
    children: [
      { id: 'agrupamentos', title: 'Agrupamentos' },
      { id: 'atividades_vez', title: 'Atividades VEZ' },
      { id: 'demandas', title: 'Demandas' },
      { id: 'demandas_lider', title: 'Demandas Líder' },
    ],
  },
  { id: 'divider1', title: '', icon: () => null, isHeading: true },
  {
    id: 'rh',
    title: 'Recursos Humanos',
    icon: ContactsBookIcon,
    children: [
      { id: 'rh_paineis', title: 'Painéis' },
      { id: 'cadastro_funcional', title: 'Cadastro Funcional' },
      { id: 'ferias', title: 'Férias' },
      { id: 'equipes', title: 'Equipes' },
      { id: 'formacao_diaria', title: 'Formação Diária' },
      { id: 'organizar_equipes', title: 'Organizar Equipe' },
    ],
  },
  { id: 'divider3', title: '', icon: () => null, isHeading: true },
  {
    id: 'mapas',
    title: 'Mapas',
    icon: MapIcon,
    children: [{ id: 'mapas_impressos', title: 'Impressos' }],
  },
  { id: 'divider4', title: '', icon: () => null, isHeading: true },
  {
    id: 'ti',
    title: 'TI',
    icon: ComputerIcon,
    children: [
      { id: 'ti_usuarios', title: 'Usuários' },
      { id: 'ti_cadastros', title: 'Cadastros' },
      { id: 'ti_sistemas', title: 'Sistemas' },
    ],
  },
];

const colorMap: { [key: string]: string } = {
  arboviroses: 'text-teal-500 dark:text-teal-400',
  rh: 'text-amber-500 dark:text-amber-400',
  mapas: 'text-sky-500 dark:text-sky-400',
  ti: 'text-fuchsia-500 dark:text-fuchsia-400',
};

const hoverGlowMap: { [key: string]: string } = {
  arboviroses: 'dark:hover:bg-teal-500/10 dark:group-hover:shadow-[0_0_15px_3px_rgba(45,212,191,0.3)]',
  rh: 'dark:hover:bg-amber-500/10 dark:group-hover:shadow-[0_0_15px_3px_rgba(251,191,36,0.3)]',
  mapas: 'dark:hover:bg-sky-500/10 dark:group-hover:shadow-[0_0_15px_3px_rgba(56,189,248,0.3)]',
  ti: 'dark:hover:bg-fuchsia-500/10 dark:group-hover:shadow-[0_0_15px_3px_rgba(217,70,239,0.3)]',
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const activeParent = navItems.find(item => 
      item.children?.some(child => child.id === activePage) ||
      (activePage === 'mapas_classificacao' && item.id === 'arboviroses')
    );
    if (activeParent) {
      setOpenMenu(activeParent.id);
    }
  }, [activePage]);

  const toggleMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-72 h-full pt-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <ul className="h-full px-3 py-4 overflow-y-auto">
        {navItems.map((item) =>
          item.isHeading ? (
            <li key={item.id} className="px-3 pt-2">
              <hr className="border-t border-slate-200 dark:border-slate-800" />
            </li>
          ) : (
            <li key={item.id} className="my-1 group">
              <button
                onClick={() => toggleMenu(item.id)}
                className={`w-full flex items-center p-2 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-transparent ${hoverGlowMap[item.id] || ''} transition-all duration-300`}
              >
                <item.icon className={`w-6 h-6 ${colorMap[item.id] || 'text-slate-500 dark:text-slate-400'} transition duration-75`} />
                <span className="ml-3 flex-1 text-left whitespace-nowrap">{item.title}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                    openMenu === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <ul
                className={`grid transition-[grid-template-rows] ease-in-out duration-300 ${openMenu === item.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div className="pl-8 py-1 space-y-1">
                  {item.children?.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => onNavigate(child.id)}
                        className={`flex items-center w-full p-2 text-sm text-slate-500 dark:text-slate-400 transition duration-75 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 ${activePage === child.id ? 'bg-slate-200 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50' : ''}`}
                      >
                        {child.title}
                      </button>
                    </li>
                  ))}
                  </div>
                </div>
              </ul>
            </li>
          )
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;