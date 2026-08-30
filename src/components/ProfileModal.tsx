import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Phone, MapPin, Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [travelType, setTravelType] = useState('');
  const [preferredDestinations, setPreferredDestinations] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setTravelType(user.travelType || '');
      setPreferredDestinations(user.preferredDestinations || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        name,
        phone,
        travelType,
        preferredDestinations,
      });
      setSuccessMsg('Profile updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-8 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
        >
          &times;
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
          />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            <span className="inline-flex items-center space-x-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <Shield className="w-3 h-3 text-sky-600" />
              <span>{user.role}</span>
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Travel Style / Persona</label>
            <input
              type="text"
              placeholder="e.g. Solo Explorer, Backpacker, Foodie"
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Preferred Destinations</label>
            <textarea
              rows={2}
              placeholder="e.g. Japan, Iceland, Switzerland, Greece"
              value={preferredDestinations}
              onChange={(e) => setPreferredDestinations(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md cursor-pointer transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
