
import React from 'react';
import { View, User } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  currentUser: User | null;
  onLogout: () => void;
  onLogin: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser, onLogout, onLogin, onLogoClick }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onLogoClick || (() => setView('landing'))} title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-800">QuickOrder <span className="text-primary">UPI</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-full border border-slate-200">
                <button 
                    onClick={() => setView('customer')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${currentView === 'customer' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Store
                </button>
                <button 
                    onClick={() => setView('admin')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${currentView === 'admin' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Admin
                </button>
            </div>

            <div className="h-6 w-px bg-slate-300 mx-2"></div>

            {currentUser ? (
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                         {currentUser.avatar ? (
                             <img src={currentUser.avatar} alt="User" className="h-8 w-8 rounded-full border border-slate-200" />
                         ) : (
                             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                 {currentUser.name.charAt(0)}
                             </div>
                         )}
                         <span className="text-sm font-medium text-slate-700 hidden md:block">
                            {currentUser.name.split(' ')[0]}
                         </span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-3 py-1.5 text-sm font-semibold rounded-full transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                        title="Logout"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={onLogin}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-600 transition-colors shadow-sm"
                >
                    <span>Login</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
