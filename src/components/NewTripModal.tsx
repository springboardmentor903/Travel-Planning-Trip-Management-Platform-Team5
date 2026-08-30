import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, DollarSign, Image as ImageIcon, Sparkles } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (tripData: {
    tripName: string;
    destination: string;
    startDate: string;
    endDate: string;
    description?: string;
    budgetAmount?: number;
    currency?: string;
    coverImage?: string;
  }) => Promise<void>;
  prefilledDestination?: string;
  prefilledBudget?: number;
  prefilledCoverImage?: string;
}

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', // Kyoto
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', // Santorini
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', // Iceland
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', // Amalfi
  'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', // Zermatt
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', // Bali
];

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
  prefilledDestination = '',
  prefilledBudget = 2500,
  prefilledCoverImage = '',
}) => {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState(prefilledDestination || 'Kyoto, Japan');
  const [startDate, setStartDate] = useState('2026-05-15');
  const [endDate, setEndDate] = useState('2026-05-22');
  const [budgetAmount, setBudgetAmount] = useState(prefilledBudget || 2500);
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(
    prefilledCoverImage || SAMPLE_COVERS[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefilledDestination) {
      setDestination(prefilledDestination);
      setTripName(`Expedition to ${prefilledDestination.split(',')[0]}`);
    }
    if (prefilledBudget) setBudgetAmount(prefilledBudget);
    if (prefilledCoverImage) setCoverImage(prefilledCoverImage);
  }, [prefilledDestination, prefilledBudget, prefilledCoverImage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName || !destination || !startDate || !endDate) return;

    try {
      setLoading(true);
      await onCreateTrip({
        tripName,
        destination,
        startDate,
        endDate,
        description,
        budgetAmount: Number(budgetAmount),
        currency,
        coverImage,
      });
      onClose();
    } catch (err) {
      console.error('Create trip error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-8 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md text-white">
              <Plane className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Create New Trip</h2>
              <p className="text-xs text-slate-500 font-medium">Plan a journey, set budget, and draft itineraries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Trip Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cherry Blossom Tour in Kyoto"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Destination *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Kyoto, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Total Budget Limit *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="number"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Trip Overview / Notes</label>
            <textarea
              rows={2}
              placeholder="Highlight trip goals, traveling companions, flight details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          {/* Select Cover Photo */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Choose Cover Photo</label>
            <div className="grid grid-cols-6 gap-2">
              {SAMPLE_COVERS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverImage(url)}
                  className={`relative h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    coverImage === url ? 'border-sky-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="cover" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Launch Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
