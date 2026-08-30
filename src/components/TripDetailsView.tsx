import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  PieChart,
  DollarSign,
  ListTodo,
  Info,
  Edit3,
  Trash2,
  Share2,
} from 'lucide-react';
import { Trip } from '../types';
import { ItineraryView } from './ItineraryView';
import { ExpenseTracker } from './ExpenseTracker';

interface TripDetailsViewProps {
  trip: Trip;
  allTrips: Trip[];
  onBack: () => void;
  onUpdateTripStatus: (tripId: string, status: 'PLANNED' | 'ONGOING' | 'COMPLETED') => Promise<void>;
  onAddDay: (tripId: string, dayData: any) => Promise<void>;
  onAddActivity: (tripId: string, itineraryId: string, activityData: any) => Promise<void>;
  onToggleActivity: (activityId: string) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
  onAddExpense: (tripId: string, expense: any) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onUpdateBudget: (tripId: string, amount: number, currency: string) => Promise<void>;
}

export const TripDetailsView: React.FC<TripDetailsViewProps> = ({
  trip,
  allTrips,
  onBack,
  onUpdateTripStatus,
  onAddDay,
  onAddActivity,
  onToggleActivity,
  onDeleteActivity,
  onAddExpense,
  onDeleteExpense,
  onUpdateBudget,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'expenses' | 'overview'>('itinerary');

  const totalSpent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const budgetLimit = trip.budget?.amount || 1;
  const allActivities = trip.itineraries
    ? trip.itineraries.flatMap((it) => it.activities || [])
    : [];
  const completedActivities = allActivities.filter((a) => a.completed).length;

  return (
    <div id="trip-detail-view" className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.tripName}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Back and Status Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            id="btn-back-to-trips"
            onClick={onBack}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trips</span>
          </button>

          <div className="flex items-center space-x-2">
            <select
              value={trip.status}
              onChange={(e) =>
                onUpdateTripStatus(
                  trip.id,
                  e.target.value as 'PLANNED' | 'ONGOING' | 'COMPLETED'
                )
              }
              className="bg-slate-900/90 text-xs font-bold text-sky-400 py-1.5 px-3 rounded-xl border border-slate-700 focus:outline-none backdrop-blur-md cursor-pointer"
            >
              <option value="PLANNED">Status: Planned</option>
              <option value="ONGOING">Status: Active / Ongoing</option>
              <option value="COMPLETED">Status: Completed</option>
            </select>
          </div>
        </div>

        {/* Bottom Title & Quick Stats */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
          <div className="flex items-center space-x-2 text-xs text-sky-400 font-semibold mb-1">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
            <span>&bull;</span>
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-300">
              {trip.startDate} to {trip.endDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {trip.tripName}
          </h1>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-200">
              <span className="text-slate-400">Budget: </span>
              <span className="font-bold text-white">
                {trip.budget?.currency} {budgetLimit.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-200">
              <span className="text-slate-400">Spent: </span>
              <span className="font-bold text-amber-400">
                {trip.budget?.currency} {totalSpent.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-200">
              <span className="text-slate-400">Activities: </span>
              <span className="font-bold text-sky-400">
                {completedActivities}/{allActivities.length} Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('itinerary')}
          className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'itinerary'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Itinerary & Schedule</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'expenses'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Expenses & Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Trip Overview</span>
        </button>
      </div>

      {/* Sub Views */}
      {activeSubTab === 'itinerary' && (
        <ItineraryView
          trip={trip}
          onAddDay={onAddDay}
          onAddActivity={onAddActivity}
          onToggleActivity={onToggleActivity}
          onDeleteActivity={onDeleteActivity}
        />
      )}

      {activeSubTab === 'expenses' && (
        <ExpenseTracker
          trips={allTrips}
          selectedTripId={trip.id}
          onSelectTripId={() => {}}
          onAddExpense={onAddExpense}
          onDeleteExpense={onDeleteExpense}
          onUpdateBudget={onUpdateBudget}
        />
      )}

      {activeSubTab === 'overview' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Trip Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-normal">
              {trip.description || 'No description provided for this trip.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Travel Schedule
              </span>
              <p className="text-sm font-bold text-slate-900">
                {trip.startDate} &mdash; {trip.endDate}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {trip.itineraries?.length || 0} scheduled itinerary days
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Financial Benchmark
              </span>
              <p className="text-sm font-bold text-slate-900">
                {trip.budget?.currency} {trip.budget?.amount.toLocaleString()} Target
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Currently spent: {trip.budget?.currency} {totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
