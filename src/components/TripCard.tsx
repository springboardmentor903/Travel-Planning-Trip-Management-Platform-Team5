import React from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onSelectTrip: (trip: Trip) => void;
  onAddExpense: (trip: Trip) => void;
  onDeleteTrip?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelectTrip,
  onAddExpense,
  onDeleteTrip,
}) => {
  const totalSpent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const budgetLimit = trip.budget?.amount || 1;
  const spendPercentage = Math.min(Math.round((totalSpent / budgetLimit) * 100), 100);
  const isOverBudget = totalSpent > budgetLimit;

  // Calculate total activities and completed activities
  const allActivities = trip.itineraries
    ? trip.itineraries.flatMap((it) => it.activities || [])
    : [];
  const completedActivities = allActivities.filter((a) => a.completed).length;

  const getStatusBadge = () => {
    switch (trip.status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/90 text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-sm">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-600 text-white shadow-sm">
            Planned
          </span>
        );
    }
  };

  return (
    <div
      id={`trip-card-${trip.id}`}
      className="group bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg text-slate-800"
    >
      {/* Cover Image & Header Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.tripName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

        {/* Top Status & Delete */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div>{getStatusBadge()}</div>
          {onDeleteTrip && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${trip.tripName}"?`)) {
                  onDeleteTrip(trip.id);
                }
              }}
              title="Delete Trip"
              className="p-1.5 rounded-full bg-slate-900/70 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors backdrop-blur-sm"
            >
              <span className="text-xs font-bold px-1">&times;</span>
            </button>
          )}
        </div>

        {/* Destination Pin & Title */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center space-x-1.5 text-sky-300 text-xs font-bold mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{trip.destination}</span>
          </div>
          <h3 className="text-lg font-extrabold text-white leading-tight truncate">{trip.tripName}</h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Date & Itinerary Progress */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {trip.startDate} - {trip.endDate}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {completedActivities}/{allActivities.length} Done
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {trip.description || 'Custom curated travel itinerary with scheduled daily activities.'}
        </p>

        {/* Budget Progress Indicator */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-slate-500 flex items-center space-x-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Budget Spent</span>
            </span>
            <span className="text-slate-800 font-bold">
              {trip.budget?.currency || '$'}
              {totalSpent.toLocaleString()} / {trip.budget?.currency || '$'}
              {budgetLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : spendPercentage > 75
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600'
              }`}
              style={{ width: `${spendPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            id={`btn-open-trip-${trip.id}`}
            onClick={() => onSelectTrip(trip)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id={`btn-add-expense-${trip.id}`}
            onClick={() => onAddExpense(trip)}
            title="Log Expense"
            className="flex items-center justify-center p-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
