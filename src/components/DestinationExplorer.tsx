import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sun,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Heart,
  Calendar,
  DollarSign,
  Search,
  Sparkles,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import { Destination, WeatherInfo } from '../types';
import { destinationService } from '../services/api';

interface DestinationExplorerProps {
  onPlanTripForDestination: (destName: string, budget?: number, coverImage?: string) => void;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  onPlanTripForDestination,
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [weatherCity, setWeatherCity] = useState('Kyoto');
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
    fetchWeather(weatherCity);
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationService.getDestinations(searchQuery, selectedContinent);
      setDestinations(data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (city: string) => {
    try {
      setWeatherLoading(true);
      const data = await destinationService.getWeather(city);
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDestinations();
  };

  const handleToggleFavorite = async (destId: string) => {
    try {
      const res = await destinationService.toggleFavorite(destId);
      setDestinations((prev) =>
        prev.map((d) => (d.id === destId ? { ...d, isFavorite: res.isFavorite } : d))
      );
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleWeatherSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (weatherCity.trim()) {
      fetchWeather(weatherCity);
    }
  };

  return (
    <div id="destination-explorer-module" className="space-y-6">
      {/* Top Banner & Live Weather Search Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/40 p-6 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Intro */}
          <div className="lg:col-span-6 space-y-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Worldwide Destination Discovery</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Explore Curated Wonders & Real-time Weather
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Find inspiration for your next itinerary with authentic traveler insights, climate forecasts, and daily budget benchmarks.
            </p>
          </div>

          {/* Right Column: Live Weather Widget */}
          <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-inner">
            <form onSubmit={handleWeatherSearch} className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Check live weather for city..."
                  value={weatherCity}
                  onChange={(e) => setWeatherCity(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </form>

            {weatherData && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
                    <Sun className="w-7 h-7 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-white text-base">{weatherData.city}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">({weatherData.condition})</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Feels like {weatherData.feelsLike}&deg;C</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-white">{weatherData.temperature}&deg;C</span>
                    <span className="block text-[10px] text-slate-400">Current</span>
                  </div>

                  <div className="space-y-1 border-l border-slate-700 pl-3 text-slate-300 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Droplets className="w-3 h-3 text-sky-400" />
                      <span>{weatherData.humidity}% Humidity</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Wind className="w-3 h-3 text-teal-400" />
                      <span>{weatherData.windSpeed} km/h Wind</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Continent Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Asia', 'Europe', 'America'].map((continent) => (
            <button
              key={continent}
              onClick={() => {
                setSelectedContinent(continent);
                destinationService.getDestinations(searchQuery, continent).then(setDestinations);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedContinent === continent
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search destination, country, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 w-56 sm:w-64 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            id={`destination-card-${dest.id}`}
            className="group bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            {/* Image & Overlay */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Continent & Favorite */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 text-sky-300 border border-sky-500/30 backdrop-blur-sm">
                  {dest.continent}
                </span>

                <button
                  id={`btn-fav-${dest.id}`}
                  onClick={() => handleToggleFavorite(dest.id)}
                  className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                    dest.isFavorite
                      ? 'bg-rose-500/90 text-white shadow-md shadow-rose-500/30'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white'
                  }`}
                  title={dest.isFavorite ? 'Remove Favorite' : 'Save as Favorite'}
                >
                  <Heart className={`w-3.5 h-3.5 ${dest.isFavorite ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Title & Country */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-xl font-extrabold text-white leading-tight">{dest.name}</h3>
                <p className="text-xs text-sky-400 font-bold flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{dest.country}</span>
                </p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">{dest.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {dest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Highlights & Meta */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Best Season</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate block">
                    {dest.bestTimeToVisit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Daily Cost</span>
                  <span className="font-extrabold text-emerald-600 text-[11px]">
                    ~{dest.currency} {dest.averageDailyCost}/day
                  </span>
                </div>
              </div>

              {/* Popular Attractions */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Key Attractions
                </span>
                <div className="text-xs text-slate-600 line-clamp-1 font-medium">
                  {dest.popularAttractions.join(' • ')}
                </div>
              </div>

              {/* Plan Trip Button */}
              <button
                id={`btn-plan-for-${dest.id}`}
                onClick={() =>
                  onPlanTripForDestination(
                    `${dest.name}, ${dest.country}`,
                    dest.averageDailyCost * 7,
                    dest.imageUrl
                  )
                }
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Trip to {dest.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
