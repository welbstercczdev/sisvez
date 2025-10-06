import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 text-center">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} SisVEZ. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;