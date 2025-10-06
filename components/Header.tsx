import React, { useState, useRef, useEffect, useContext } from 'react';
import { MenuIcon, BellIcon, QuestionCircleIcon, PersonIcon, BoxArrowRightIcon, SunIcon, MoonIcon } from './icons/IconComponents';
import { ThemeContext } from '../contexts/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 bg-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-teal-500 shadow-md dark:shadow-lg px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center">
        <div className="flex items-center">
          <img src="https://picsum.photos/40/40" alt="Logo" className="h-8 w-auto mr-3 rounded-full" />
          <span className="hidden md:block text-2xl font-semibold text-slate-800 dark:text-white tracking-wide">SisVEZ</span>
        </div>
        <button onClick={onToggleSidebar} className="text-slate-500 dark:text-white/80 hover:text-slate-800 dark:hover:text-white ml-4 lg:ml-8 transition-colors duration-200">
          <MenuIcon className="w-8 h-8"/>
        </button>
      </div>

      <nav className="ml-auto">
        <ul className="flex items-center space-x-2 sm:space-x-4">
           <li>
            <button onClick={toggleTheme} className="text-slate-500 dark:text-white/80 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
              {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
            </button>
          </li>
          <li className="relative">
            <button className="text-slate-500 dark:text-white/80 hover:text-slate-800 dark:hover:text-white transition-colors duration-200">
              <BellIcon className="w-6 h-6"/>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-fuchsia-500 text-white text-xs items-center justify-center">4</span>
              </span>
            </button>
          </li>
          <li className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center">
              <img src="https://picsum.photos/seed/user/32/32" alt="Profile" className="rounded-full w-8 h-8" />
              <span className="hidden md:block ml-2 text-sm font-medium text-slate-700 dark:text-white">WELBSTER</span>
              <svg className={`hidden md:block ml-1 w-4 h-4 text-slate-500 dark:text-white/70 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <ul className={`absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800/80 dark:backdrop-blur-md rounded-lg shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out origin-top-right ${isProfileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <li className="px-4 py-2 text-right border-b border-slate-200 dark:border-slate-700">
                <h6 className="font-semibold text-slate-800 dark:text-white">WELBSTER</h6>
              </li>
              <li>
                <button onClick={() => { onNavigate('perfil'); setIsProfileOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <PersonIcon className="w-5 h-5 mr-3 text-slate-400" />
                  <span>Perfil</span>
                </button>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <QuestionCircleIcon className="w-5 h-5 mr-3 text-slate-400" />
                  <span>Precisa de Ajuda?</span>
                </a>
              </li>
              <li className="border-t border-slate-200 dark:border-slate-700">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <BoxArrowRightIcon className="w-5 h-5 mr-3 text-slate-400" />
                  <span>Sair</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;