import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { destinationService } from '../services/api';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripImported: (newTripData: any) => Promise<void>;
  prefilledDestination?: string;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  onTripImported,
  prefilledDestination = '',
}) => {
  const [destination, setDestination] = useState(prefilledDestination || 'Barcelona, Spain');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState('Culture & Architecture, Tapas, Coastal walks');
  const [budget, setBudget] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const plan = await destinationService.generateAiTrip({
        destination,
        days: Number(days),
        interests,
        budget,
      });
      setGeneratedPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTrip = async () => {
    if (!generatedPlan) return;
    try {
      setLoading(true);
      // Construct trip payload
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (generatedPlan.itineraries?.length || 3));

      const tripPayload = {
        tripName: generatedPlan.tripName || `Trip to ${generatedPlan.destination}`,
        destination: generatedPlan.destination,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        description: generatedPlan.description,
        budgetAmount: generatedPlan.recommendedBudget || 1500,
        currency: generatedPlan.currency || 'USD',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      };

      await onTripImported({
        ...tripPayload,
        itineraries: generatedPlan.itineraries,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">AI Travel Concierge</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Generate a day-by-day travel itinerary with smart budget estimation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Mode */}
        {!generatedPlan ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Destination City or Country *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rome, Italy or Maui, Hawaii"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Duration (Days)</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 Days (Weekend Getaway)</option>
                  <option value={3}>3 Days (Standard Explorer)</option>
                  <option value={4}>4 Days (Deep Dive)</option>
                  <option value={5}>5 Days (Immersive)</option>
                  <option value={7}>7 Days (Week-long Grand Tour)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Budget Preference</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Backpacker">Backpacker / Budget-Friendly</option>
                  <option value="Moderate">Moderate / Balanced</option>
                  <option value="Luxury">Luxury / Boutique High-End</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Travel Styles & Interests</label>
              <input
                type="text"
                placeholder="e.g. History, Art museums, Local street food, Photography"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Crafting AI Itinerary for {destination}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Custom Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                  AI Generated Itinerary
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Est. Budget: {generatedPlan.currency} {generatedPlan.recommendedBudget?.toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1">{generatedPlan.tripName}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{generatedPlan.description}</p>
            </div>

            {/* Generated Days Preview */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {generatedPlan.itineraries?.map((day: any) => (
                <div key={day.dayNumber} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      Day {day.dayNumber}: {day.title}
                    </span>
                  </h4>
                  <div className="space-y-1.5">
                    {day.activities?.map((act: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-start justify-between"
                      >
                        <div>
                          <span className="font-semibold text-sky-400 mr-2">{act.time}</span>
                          <span className="text-slate-200 font-medium">{act.title}</span>
                          <p className="text-slate-400 text-[10px] mt-0.5">{act.location} &bull; {act.notes}</p>
                        </div>
                        {act.cost > 0 && (
                          <span className="text-slate-300 font-semibold flex-shrink-0 ml-2">
                            ${act.cost}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGeneratedPlan(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700"
              >
                &larr; Reconfigure
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleImportTrip}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Add to My Trips</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
