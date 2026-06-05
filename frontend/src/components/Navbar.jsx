import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isMockMode } = useAuth();

  return (
    <header className="h-16 w-full border-b border-darkbg-border bg-darkbg-card/40 backdrop-blur-md px-6 flex items-center justify-between z-10">
      {/* Search / Section Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-wider text-brand uppercase">Newsroom strategist</span>
        {isMockMode && (
          <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-mono">
            Demo Mode
          </span>
        )}
      </div>

      {/* Editor Details and Logout */}
      <div className="flex items-center gap-4">
        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-darkbg-border bg-darkbg-deep/40">
          <div className="h-6 w-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-semibold">
            <FiUser size={12} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-200">{user?.displayName || 'Advisor Editor'}</p>
            <p className="text-[10px] text-gray-400 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:border-red-500"
          title="Sign Out"
        >
          <FiLogOut size={14} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
