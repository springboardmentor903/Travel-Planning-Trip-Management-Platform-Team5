import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Tag,
  DollarSign,
  FileText,
  Compass,
  Utensils,
  Car,
  Coffee,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Trip, ItineraryDay, Activity } from '../types';

interface ItineraryViewProps {
  trip: Trip;
  onAddDay: (tripId: string, dayData: { title?: string; date?: string; dayNumber?: number }) => Promise<void>;
  onAddActivity: (
    tripId: string,
    itineraryId: string,
    activityData: {
      time: string;
      title: string;
      location: string;
      notes?: string;
      cost?: number;
      category?: string;
    }
  ) => Promise<void>;
  onToggleActivity: (activityId: string) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
}

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; label: string; badgeClass: string }> = {
  SIGHTSEEING: {
    icon: <Compass className="w-3.5 h-3.5" />,
    label: 'Sightseeing',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  DINING: {
    icon: <Utensils className="w-3.5 h-3.5" />,
    label: 'Dining',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  TRANSPORT: {
    icon: <Car className="w-3.5 h-3.5" />,
    label: 'Transport',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  RELAXATION: {
    icon: <Coffee className="w-3.5 h-3.5" />,
    label: 'Relaxation',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ADVENTURE: {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    label: 'Adventure',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  HOTEL: {
    icon: <Coffee className="w-3.5 h-3.5" />,
    label: 'Hotel / Stay',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  OTHER: {
    icon: <Tag className="w-3.5 h-3.5" />,
    label: 'Other',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onAddDay,
  onAddActivity,
  onToggleActivity,
  onDeleteActivity,
}) => {
  const itineraries = trip.itineraries || [];
  const [selectedDayId, setSelectedDayId] = useState<string>(
    itineraries.length > 0 ? itineraries[0].id : ''
  );

  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayDate, setNewDayDate] = useState(trip.startDate);

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [activityForm, setActivityForm] = useState<{
    time: string;
    title: string;
    location: string;
    notes: string;
    cost: string;
    category: 'SIGHTSEEING' | 'DINING' | 'TRANSPORT' | 'RELAXATION' | 'ADVENTURE';
  }>({
    time: '10:00',
    title: '',
    location: trip.destination,
    notes: '',
    cost: '0',
    category: 'SIGHTSEEING',
  });

  const activeDay = itineraries.find((it) => it.id === selectedDayId) || itineraries[0];

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddDay(trip.id, {
      title: newDayTitle || `Day ${itineraries.length + 1} Discovery`,
      date: newDayDate || trip.startDate,
      dayNumber: itineraries.length + 1,
    });
    setNewDayTitle('');
    setIsAddingDay(false);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay || !activityForm.title) return;

    await onAddActivity(trip.id, activeDay.id, {
      time: activityForm.time,
      title: activityForm.title,
      location: activityForm.location,
      notes: activityForm.notes,
      cost: Number(activityForm.cost) || 0,
      category: activityForm.category,
    });

    setActivityForm({
      time: '10:00',
      title: '',
      location: trip.destination,
      notes: '',
      cost: '0',
      category: 'SIGHTSEEING',
    });
    setIsAddingActivity(false);
  };

  return (
    <div id="itinerary-manager-view" className="space-y-6">
      {/* Days Tabs Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Itinerary Schedule ({itineraries.length} Days)</span>
          </h3>
          <button
            id="btn-add-itinerary-day"
            onClick={() => setIsAddingDay(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day</span>
          </button>
        </div>

        {/* Days Horizontal Scroll Tabs */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {itineraries.map((day) => {
            const isSelected = activeDay?.id === day.id;
            const completedCount = day.activities?.filter((a) => a.completed).length || 0;
            const totalCount = day.activities?.length || 0;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center justify-between space-x-3 text-xs mb-0.5">
                  <span className="font-extrabold uppercase tracking-wide">Day {day.dayNumber}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {day.date}
                  </span>
                </div>
                <div className="text-xs truncate max-w-[160px]">{day.title}</div>
                <div
                  className={`text-[10px] mt-1 ${
                    isSelected ? 'text-sky-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  {totalCount === 0 ? 'No activities' : `${completedCount}/${totalCount} Done`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Detail & Activities */}
      {activeDay ? (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">
                Day {activeDay.dayNumber} &bull; {activeDay.date}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeDay.title}</h2>
            </div>

            <button
              id="btn-add-activity-modal"
              onClick={() => setIsAddingActivity(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Activity</span>
            </button>
          </div>

          {/* Activities Timeline */}
          {activeDay.activities && activeDay.activities.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 pl-2">
              {activeDay.activities.map((activity) => {
                const catInfo =
                  CATEGORY_STYLES[activity.category] || CATEGORY_STYLES['SIGHTSEEING'];

                return (
                  <div
                    key={activity.id}
                    className={`relative flex items-start space-x-3 p-4 rounded-xl border transition-all ${
                      activity.completed
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Checkbox Toggle Button */}
                    <button
                      id={`toggle-activity-${activity.id}`}
                      onClick={() => onToggleActivity(activity.id)}
                      className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                      title={activity.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {activity.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-sky-600" />
                      )}
                    </button>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="flex items-center space-x-1 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </span>

                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${catInfo.badgeClass}`}
                        >
                          {catInfo.icon}
                          <span>{catInfo.label}</span>
                        </span>

                        {activity.cost !== undefined && activity.cost > 0 && (
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {trip.budget?.currency || '$'} {activity.cost}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-extrabold text-slate-900 leading-tight ${
                          activity.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {activity.title}
                      </h4>

                      {activity.location && (
                        <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{activity.location}</span>
                        </div>
                      )}

                      {activity.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-2 border border-slate-200/80 font-normal">
                          {activity.notes}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      id={`delete-activity-${activity.id}`}
                      onClick={() => onDeleteActivity(activity.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors self-start cursor-pointer"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No activities scheduled for this day</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Add Activity" to plan your morning, afternoon, or evening stops.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500">No itinerary days created yet. Click "Add Day" above.</p>
        </div>
      )}

      {/* Add Day Modal */}
      {isAddingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Add Itinerary Day</h3>
              <button
                onClick={() => setIsAddingDay(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDay} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Day Theme / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Historic Castles & Waterfront Dining"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newDayDate}
                  onChange={(e) => setNewDayDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingDay(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm cursor-pointer"
                >
                  Save Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isAddingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Add Activity to Day {activeDay?.dayNumber}</h3>
              <button
                onClick={() => setIsAddingActivity(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="SIGHTSEEING">Sightseeing</option>
                    <option value="DINING">Dining</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="RELAXATION">Relaxation</option>
                    <option value="ADVENTURE">Adventure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Golden Pavilion Shrine"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto Central"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Est. Cost ({trip.budget?.currency || '$'})</label>
                  <input
                    type="number"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Travel Notes / Tips</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pre-booked tickets required; wear walking shoes..."
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingActivity(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md cursor-pointer"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
