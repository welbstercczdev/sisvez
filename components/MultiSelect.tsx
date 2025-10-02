import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { XIcon, SearchIcon, ChevronDownIcon } from './icons/IconComponents';

interface MultiSelectProps {
  options: User[];
  selectedValues: User[];
  onChange: (selected: User[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedValues, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    if (selectedValues.some(sv => sv.id === user.id)) {
      onChange(selectedValues.filter(sv => sv.id !== user.id));
    } else {
      onChange([...selectedValues, user]);
    }
  };

  const removeSelected = (user: User) => {
    onChange(selectedValues.filter(sv => sv.id !== user.id));
  };

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.some(sv => sv.id === option.id)
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex flex-wrap gap-2 items-center w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 min-h-[42px] cursor-pointer"
      >
        {selectedValues.length === 0 && <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        {selectedValues.map(user => (
          <div key={user.id} className="flex items-center gap-1 bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-200 text-xs font-medium px-2 py-1 rounded-full">
            {user.name}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeSelected(user); }} className="text-sky-500 hover:text-sky-700 dark:hover:text-sky-300">
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-700">
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm pl-9 p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <ul>
            {filteredOptions.map(option => (
              <li key={option.id} onClick={() => handleSelect(option)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer">
                {option.name}
              </li>
            ))}
             {filteredOptions.length === 0 && (
                 <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">Nenhum usuário encontrado.</li>
             )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;