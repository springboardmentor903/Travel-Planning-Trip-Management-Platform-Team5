"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Trip, Destination, UserProfile, WeatherInfo } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  Compass,
  Plus,
  CloudSun,
  MapPin,
  Clock,
  ArrowRight,
  Eye,
  Loader2,
  CheckCircle2,
  Star,
  User,
  Settings,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState<string>("Traveler");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Destination[]>([]);
  const [dashboardWeather, setDashboardWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user trips, profile, destinations from backend
    Promise.all([
      api.get("/trips/my-trips").catch(() => ({ data: [] })),
      api.get("/user/profile").catch(() => ({ data: null })),
      api.get("/destinations").catch(() => ({ data: [] })),
    ])
      .then(([tripsRes, profileRes, destRes]) => {
        const fetchedTrips: Trip[] = Array.isArray(tripsRes.data) ? tripsRes.data : [];
        setTrips(fetchedTrips);

        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        const dests: Destination[] = Array.isArray(destRes.data) ? destRes.data : [];
        setPopularDestinations(dests.filter((d) => d.isPopular));

        // Get weather for first upcoming trip's destination or first popular destination
        const upcomingTrip = fetchedTrips.find(
          (t) => t.status === "PLANNED" || t.status === "ONGOING"
        );
        const targetDestId = upcomingTrip?.destination?.id || (dests.length > 0 ? dests[0].id : null);

        if (targetDestId) {
          api
            .get(`/destinations/${targetDestId}/weather`)
            .then((wRes) => setDashboardWeather(wRes.data))
            .catch((err) => console.log("Dashboard weather fetch error:", err));
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const upcomingTrips = trips.filter((t) => t.status === "PLANNED" || t.status === "ONGOING");
  const recentTrips = trips.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED");

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
      <Navbar />

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-sky-700 via-sky-800 to-sky-900 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-600/60 border border-sky-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to your Travel Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Hello, {userName}!</h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              Here is your overall travel summary, upcoming itineraries, and destination recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md transition text-xs"
            >
              <Plus className="w-4 h-4" /> Create New Trip
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 bg-sky-600/80 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-xl border border-sky-500 transition text-xs"
            >
              <Compass className="w-4 h-4 text-amber-300" /> Browse Destinations
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs">Loading dashboard information...</p>
          </div>
        ) : (
          <>
            {/* Stat Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Trips</span>
                  <span className="text-xl font-extrabold text-sky-950">{trips.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Trips</span>
                  <span className="text-xl font-extrabold text-sky-950">{upcomingTrips.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Trips</span>
                  <span className="text-xl font-extrabold text-sky-950">{recentTrips.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Places</span>
                  <span className="text-xl font-extrabold text-sky-950">{popularDestinations.length}</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Upcoming Trips Section */}
                <section className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <h2 className="text-lg font-bold text-sky-950">Upcoming Trips</h2>
                    </div>
                    <Link href="/trips" className="text-xs font-bold text-sky-600 hover:underline">
                      View All Trips →
                    </Link>
                  </div>

                  {upcomingTrips.length === 0 ? (
                    <div className="py-8 text-center bg-sky-50/50 rounded-2xl border border-sky-100">
                      <p className="text-xs text-slate-500 mb-3">No upcoming trips planned right now.</p>
                      <Link
                        href="/trips/new"
                        className="inline-flex items-center gap-1.5 bg-sky-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-sky-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Plan a New Trip
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTrips.slice(0, 3).map((trip) => (
                        <div
                          key={trip.id}
                          className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-sky-950">{trip.title}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {trip.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              {trip.destination && (
                                <span className="flex items-center gap-1 font-medium text-sky-700">
                                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                  {trip.destination.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {trip.startDate} to {trip.endDate}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/trips/${trip.id}`}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 hover:bg-sky-50 transition shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" /> Open Itinerary
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Trips Section */}
                <section className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-lg font-bold text-sky-950">Recent Trips & History</h2>
                    </div>
                    <Link href="/history" className="text-xs font-bold text-sky-600 hover:underline">
                      Full History →
                    </Link>
                  </div>

                  {recentTrips.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No completed past trips recorded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentTrips.slice(0, 4).map((trip) => (
                        <div key={trip.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{trip.title}</h4>
                          {trip.destination && (
                            <p className="text-[11px] text-sky-700 font-medium mt-0.5">
                              📍 {trip.destination.name}, {trip.destination.country}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {trip.startDate} - {trip.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Popular Destinations Showcase */}
                <section className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                      <h2 className="text-lg font-bold text-sky-950">Popular Destinations</h2>
                    </div>
                    <Link href="/destinations" className="text-xs font-bold text-sky-600 hover:underline">
                      View All →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {popularDestinations.slice(0, 3).map((dest) => (
                      <div
                        key={dest.id}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-extrabold text-sm text-sky-950">{dest.name}</h4>
                          <span className="text-[10px] text-sky-600 font-semibold block mb-2">📍 {dest.country}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{dest.description}</p>
                        </div>
                        <Link
                          href={`/destinations/${dest.id}`}
                          className="mt-3 text-[11px] font-bold text-amber-600 hover:underline inline-block"
                        >
                          Explore & Weather →
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Live Weather Widget */}
                <div className="bg-gradient-to-br from-sky-600 to-sky-800 text-white p-6 rounded-3xl shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-500/50 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-200">
                      <CloudSun className="w-4 h-4 text-amber-300" /> Destination Weather
                    </div>
                    <span className="text-[10px] bg-sky-800/80 px-2 py-0.5 rounded-md text-sky-100">Live API</span>
                  </div>

                  {dashboardWeather ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-sky-200 block">{dashboardWeather.destinationName}</span>
                          <span className="text-3xl font-black">{dashboardWeather.temperature}°C</span>
                        </div>
                        <span className="text-4xl">{dashboardWeather.weatherIcon}</span>
                      </div>
                      <p className="text-xs text-amber-300 font-semibold mt-1">{dashboardWeather.condition}</p>
                      <div className="text-[10px] text-sky-200 mt-3 pt-2 border-t border-sky-500/40 flex justify-between">
                        <span>Wind: {dashboardWeather.windSpeed} km/h</span>
                        <span>Humidity: {dashboardWeather.humidity}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-sky-200">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                      Loading weather details...
                    </div>
                  )}
                </div>

                {/* User Travel Preferences Card */}
                <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-sky-950 flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-600" /> Travel Preferences
                    </h3>
                    <Link href="/profile" className="text-xs font-bold text-sky-600 hover:underline">
                      Edit
                    </Link>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Travel Style</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {profile?.travelPreferences || "Adventure, Cultural, Budget"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Favourite Destinations</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {profile?.favoriteDestinations || "Paris, Bali, Tokyo"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links / Actions */}
                <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-3 text-xs">
                  <h4 className="font-bold text-sky-950 border-b border-slate-100 pb-2">Quick Actions</h4>
                  <Link
                    href="/trips/new"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold transition"
                  >
                    <span>➕ Create New Trip</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold transition"
                  >
                    <span>👤 View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold transition"
                  >
                    <span>⚙️ Account Settings</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
