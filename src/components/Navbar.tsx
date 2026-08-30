import React from 'react';
import {
  Compass,
  MapPin,
  PieChart,
  Calendar,
  Sparkles,
  PlusCircle,
  LogOut,
  UserCheck,
  Shield,
  Plane,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'trips' | 'expenses' | 'destinations' | 'ai-planner';
  setActiveTab: (tab: 'dashboard' | 'trips' | 'expenses' | 'destinations' | 'ai-planner') => void;
  onOpenNewTripModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTripModal,
  onOpenProfileModal,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Voyage<span className="text-sky-400">Craft</span>
                </span>
                <span className="text-[10px] uppercase font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded tracking-wide">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Travel & Expense Planner</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-trips"
              onClick={() => setActiveTab('trips')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'trips'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Trips</span>
            </button>

            <button
              id="nav-tab-expenses"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Expenses & Budget</span>
            </button>

            <button
              id="nav-tab-destinations"
              onClick={() => setActiveTab('destinations')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'destinations'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Destinations</span>
            </button>

            <button
              id="nav-tab-ai-planner"
              onClick={() => setActiveTab('ai-planner')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai-planner'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Planner</span>
            </button>
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Quick Action Button */}
            <button
              id="btn-new-trip-navbar"
              onClick={onOpenNewTripModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Trip</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-user-profile"
                  onClick={onOpenProfileModal}
                  className="flex items-center space-x-2 p-1.5 pl-2 pr-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors text-left"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-sky-400/70"
                  />
                  <div className="hidden lg:block text-xs">
                    <p className="font-bold text-slate-200 leading-tight truncate max-w-[100px]">{user.name}</p>
                    <span className="text-[10px] text-sky-400 font-semibold">
                      {user.role === 'GROUP_ADMIN' ? 'Group Admin' : 'Traveler'}
                    </span>
                  </div>
                </button>

                <button
                  id="btn-logout"
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-demo-login"
                  onClick={() => demoLogin('alex@traveler.com')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  Demo User
                </button>
                <button
                  id="btn-open-login"
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2.5 border-t border-slate-800 space-x-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-sky-500 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'trips' ? 'bg-sky-500 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-sky-500 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'destinations' ? 'bg-sky-500 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            Destinations
          </button>
          <button
            onClick={() => setActiveTab('ai-planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'ai-planner' ? 'bg-indigo-600 text-white' : 'text-indigo-300 bg-indigo-950/40'
            }`}
          >
            AI Planner
          </button>
        </div>
      </div>
    </header>
  );
};
