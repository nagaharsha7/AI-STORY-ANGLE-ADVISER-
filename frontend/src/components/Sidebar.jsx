import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiSliders, FiGrid, FiFolder, FiBarChart2 } from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FiGrid size={18} />
    },
    {
      path: '/history',
      name: 'History Logs',
      icon: <FiFolder size={18} />
    },
    {
      path: '/analytics',
      name: 'Newsroom Analytics',
      icon: <FiBarChart2 size={18} />
    }
  ];

  return (
    <aside className="w-64 border-r border-darkbg-border bg-darkbg-card/75 backdrop-blur-md flex flex-col h-screen shrink-0">
      {/* Brand Logo Header */}
      <div className="h-16 border-b border-darkbg-border flex items-center px-6 gap-3">
        {/* News logo representation */}
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-dark to-brand flex items-center justify-center font-bold text-white shadow-md shadow-brand/20">
          T
        </div>
        <div>
          <h1 className="font-display font-extrabold text-sm tracking-tight text-white leading-none">
            TELANGANA
          </h1>
          <span className="text-[10px] font-bold text-brand uppercase tracking-wider leading-none block mt-0.5">
            Today Advisor
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                isActive
                  ? 'bg-brand/10 border-brand text-brand shadow-[inset_4px_0_12px_rgba(255,87,34,0.05)]'
                  : 'border-transparent text-gray-400 hover:bg-darkbg-hover hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-darkbg-border text-center">
        <p className="text-[10px] text-gray-500 font-mono">
          Powered by Gemini 2.5 Pro
        </p>
        <p className="text-[9px] text-gray-600 font-mono mt-0.5">
          v1.0.0 &copy; Telangana Today
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
