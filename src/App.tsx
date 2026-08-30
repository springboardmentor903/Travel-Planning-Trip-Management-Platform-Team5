import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  PieChart,
  MapPin,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Plane,
  ArrowRight,
  Sun,
  Shield,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Trip, Expense, Destination } from './types';
import { tripService, expenseService, itineraryService } from './services/api';
import { useAuth, AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TripCard } from './components/TripCard';
import { TripDetailsView } from './components/TripDetailsView';
import { ExpenseTracker } from './components/ExpenseTracker';
import { DestinationExplorer } from './components/DestinationExplorer';
import { AiPlannerModal } from './components/AiPlannerModal';
import { NewTripModal } from './components/NewTripModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'expenses' | 'destinations' | 'ai-planner'>('dashboard');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Prefill state for Modals
  const [prefillDest, setPrefillDest] = useState('');
  const [prefillBudget, setPrefillBudget] = useState<number | undefined>(undefined);
  const [prefillCover, setPrefillCover] = useState('');

  // Trip filter
  const [tripFilter, setTripFilter] = useState<'ALL' | 'PLANNED' | 'ONGOING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    if (isAuthenticated) {
      loadTrips();
    } else {
      setTrips([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      setTrips(data);
      if (selectedTrip) {
        const updated = data.find((t) => t.id === selectedTrip.id);
        if (updated) setSelectedTrip(updated);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trip Handlers
  const handleCreateTrip = async (tripData: any) => {
    const newTrip = await tripService.createTrip(tripData);
    await loadTrips();
    setSelectedTrip(newTrip);
  };

  const handleUpdateTripStatus = async (tripId: string, status: 'PLANNED' | 'ONGOING' | 'COMPLETED') => {
    await tripService.updateTrip(tripId, { status });
    await loadTrips();
  };

  const handleDeleteTrip = async (tripId: string) => {
    await tripService.deleteTrip(tripId);
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
    }
    await loadTrips();
  };

  // Itinerary Handlers
  const handleAddDay = async (tripId: string, dayData: any) => {
    await itineraryService.addDay(tripId, dayData);
    await loadTrips();
  };

  const handleAddActivity = async (tripId: string, itineraryId: string, activityData: any) => {
    await itineraryService.addActivity(tripId, itineraryId, activityData);
    await loadTrips();
  };

  const handleToggleActivity = async (activityId: string) => {
    await itineraryService.toggleActivity(activityId);
    await loadTrips();
  };

  const handleDeleteActivity = async (activityId: string) => {
    await itineraryService.deleteActivity(activityId);
    await loadTrips();
  };

  // Expense Handlers
  const handleAddExpense = async (tripId: string, expenseData: any) => {
    await expenseService.addExpense(tripId, expenseData);
    await loadTrips();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await expenseService.deleteExpense(expenseId);
    await loadTrips();
  };

  const handleUpdateBudget = async (tripId: string, amount: number, currency: string) => {
    await expenseService.updateBudget(tripId, { amount, currency });
    await loadTrips();
  };

  // AI Import Handler
  const handleImportAiTrip = async (newTripData: any) => {
    // 1. Create base trip
    const created = await tripService.createTrip({
      tripName: newTripData.tripName,
      destination: newTripData.destination,
      startDate: newTripData.startDate,
      endDate: newTripData.endDate,
      description: newTripData.description,
      budgetAmount: newTripData.budgetAmount,
      currency: newTripData.currency,
      coverImage: newTripData.coverImage,
    });

    // 2. Add itineraries and activities
    if (newTripData.itineraries && newTripData.itineraries.length > 0) {
      for (const it of newTripData.itineraries) {
        const day = await itineraryService.addDay(created.id, {
          title: it.title,
          date: created.startDate,
          dayNumber: it.dayNumber,
        });

        if (it.activities && it.activities.length > 0) {
          for (const act of it.activities) {
            await itineraryService.addActivity(created.id, day.id, {
              time: act.time,
              title: act.title,
              location: act.location,
              notes: act.notes,
              cost: act.cost,
              category: act.category,
            });
          }
        }
      }
    }

    await loadTrips();
    setSelectedTrip(created);
    setActiveTab('trips');
  };

  const handlePlanForDestination = (destName: string, budget?: number, coverImage?: string) => {
    setPrefillDest(destName);
    setPrefillBudget(budget);
    setPrefillCover(coverImage || '');
    setIsAiPlannerOpen(true);
  };

  // Aggregated Stats for Dashboard
  const totalBudgetSpent = trips.reduce(
    (acc, t) => acc + (t.expenses ? t.expenses.reduce((sum, e) => sum + e.amount, 0) : 0),
    0
  );
  const totalAllocatedBudget = trips.reduce((acc, t) => acc + (t.budget?.amount || 0), 0);
  const activeTripsCount = trips.filter((t) => t.status === 'ONGOING').length;
  const totalActivitiesCount = trips.reduce(
    (acc, t) =>
      acc + (t.itineraries ? t.itineraries.flatMap((it) => it.activities || []).length : 0),
    0
  );
  const completedActivitiesCount = trips.reduce(
    (acc, t) =>
      acc +
      (t.itineraries
        ? t.itineraries.flatMap((it) => it.activities || []).filter((a) => a.completed).length
        : 0),
    0
  );

  const filteredTrips = trips.filter((t) => {
    if (tripFilter === 'ALL') return true;
    return t.status === tripFilter;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedTrip(null);
          if (tab === 'ai-planner') {
            setIsAiPlannerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenNewTripModal={() => {
          setPrefillDest('');
          setPrefillBudget(undefined);
          setPrefillCover('');
          setIsNewTripModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If a single trip is selected for deep dive */}
        {selectedTrip ? (
          <TripDetailsView
            trip={selectedTrip}
            allTrips={trips}
            onBack={() => setSelectedTrip(null)}
            onUpdateTripStatus={handleUpdateTripStatus}
            onAddDay={handleAddDay}
            onAddActivity={handleAddActivity}
            onToggleActivity={handleToggleActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onUpdateBudget={handleUpdateBudget}
          />
        ) : (
          <>
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Hero Greeting & Quick Action Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 border border-slate-800 shadow-xl text-white">
                  <div className="relative z-10 max-w-2xl space-y-3">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Welcome back, {user ? user.name : 'Traveler'}</span>
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      Where is your wanderlust taking you next?
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Track your journeys, schedule custom daily itineraries, monitor category expenses with interactive analytics, and generate smart travel plans with AI.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        id="btn-dash-plan-ai"
                        onClick={() => {
                          setPrefillDest('Kyoto, Japan');
                          setIsAiPlannerOpen(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 hover:opacity-90 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Trip Planner</span>
                      </button>

                      <button
                        id="btn-dash-new-trip"
                        onClick={() => setIsNewTripModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Custom Trip</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dashboard Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Trips */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 border border-sky-100">
                      <Plane className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Total Trips</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{trips.length}</h3>
                    </div>
                  </div>

                  {/* Active Trips */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Active Expeditions</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600">{activeTripsCount}</h3>
                    </div>
                  </div>

                  {/* Cumulative Spend */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Total Spend</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        ${totalBudgetSpent.toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  {/* Activities Done */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Tasks Done</span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-600">
                        {completedActivitiesCount}/{totalActivitiesCount}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Active & Upcoming Trips Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Your Expeditions</h2>
                      <p className="text-xs text-slate-500 font-medium">Scheduled itineraries & live budgets</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('trips')}
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1"
                    >
                      <span>View All ({trips.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trips.slice(0, 3).map((trip) => (
                        <TripCard
                          key={trip.id}
                          trip={trip}
                          onSelectTrip={(t) => setSelectedTrip(t)}
                          onAddExpense={(t) => {
                            setSelectedTrip(t);
                          }}
                          onDeleteTrip={handleDeleteTrip}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                      <Plane className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-800">No trips planned yet</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Create your first adventure or generate one instantly using our AI trip planner.
                      </p>
                      <button
                        onClick={() => setIsNewTripModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm"
                      >
                        Create Trip
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Row: Explore Destinations Highlights */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-sky-600" />
                        <span>Curated Destinations & Climate</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Discover trending global places</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('destinations')}
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold"
                    >
                      Explore Directory &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Kyoto, Japan',
                        temp: '22°C Clear',
                        cost: '$140/day',
                        img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
                      },
                      {
                        name: 'Santorini, Greece',
                        temp: '26°C Sunny',
                        cost: '€210/day',
                        img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80',
                      },
                      {
                        name: 'Zermatt, Switzerland',
                        temp: '15°C Alpine',
                        cost: '280 CHF/day',
                        img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80',
                      },
                    ].map((dest, idx) => (
                      <div
                        key={idx}
                        onClick={() => handlePlanForDestination(dest.name)}
                        className="group relative h-32 rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={dest.img}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block truncate">{dest.name}</span>
                            <span className="text-[10px] text-sky-300 font-medium">{dest.temp} &bull; {dest.cost}</span>
                          </div>
                          <span className="text-[10px] font-bold text-white bg-sky-600 px-2 py-0.5 rounded-lg shadow-sm">
                            Plan
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MY TRIPS */}
            {activeTab === 'trips' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">My Trips ({trips.length})</h1>
                    <p className="text-xs text-slate-500 font-medium">All planned, ongoing, and past travel itineraries</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Filter */}
                    <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                      {(['ALL', 'PLANNED', 'ONGOING', 'COMPLETED'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setTripFilter(status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            tripFilter === status
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <button
                      id="btn-create-trip-page"
                      onClick={() => setIsNewTripModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>New Trip</span>
                    </button>
                  </div>
                </div>

                {filteredTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onSelectTrip={(t) => setSelectedTrip(t)}
                        onAddExpense={(t) => {
                          setSelectedTrip(t);
                        }}
                        onDeleteTrip={handleDeleteTrip}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                    <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No {tripFilter !== 'ALL' ? tripFilter.toLowerCase() : ''} trips found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Start planning a new itinerary or adjust your filter.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPENSES & BUDGET */}
            {activeTab === 'expenses' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Expense & Budget Analytics</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Interactive Chart.js category breakdown, threshold monitoring, and detailed spending logs
                  </p>
                </div>

                <ExpenseTracker
                  trips={trips}
                  selectedTripId={trips[0]?.id}
                  onSelectTripId={(id) => {}}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onUpdateBudget={handleUpdateBudget}
                />
              </div>
            )}

            {/* TAB 4: DESTINATIONS & WEATHER */}
            {activeTab === 'destinations' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <DestinationExplorer onPlanTripForDestination={handlePlanForDestination} />
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
        prefilledDestination={prefillDest}
        prefilledBudget={prefillBudget}
        prefilledCoverImage={prefillCover}
      />

      <AiPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onTripImported={handleImportAiTrip}
        prefilledDestination={prefillDest}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
