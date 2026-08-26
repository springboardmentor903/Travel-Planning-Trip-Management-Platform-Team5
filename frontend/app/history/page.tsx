"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Trip } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { History, Calendar, MapPin, Eye, Search, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function TravelHistoryPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/trips/my-trips")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTrips(res.data);
        }
      })
      .catch((err) => {
        console.log("Failed to fetch travel history:", err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Travel history includes completed trips, cancelled trips, or trips whose end date is past
  const pastTrips = trips.filter((trip) => {
    const isCompleted = trip.status === "COMPLETED" || trip.status === "CANCELLED";
    const isPastDate = new Date(trip.endDate) < new Date();
    return isCompleted || isPastDate;
  });

  const filteredHistory = pastTrips.filter((trip) => {
    const q = searchQuery.toLowerCase();
    return (
      trip.title.toLowerCase().includes(q) ||
      (trip.destination?.name && trip.destination.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-950 flex items-center gap-2">
              <History className="w-8 h-8 text-amber-500" /> Travel History
            </h1>
            <p className="text-xs text-slate-500 mt-1">Review your past travels, completed journeys, and trip logs</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search past trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs">Loading travel history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sky-100 shadow-sm max-w-md mx-auto my-8 space-y-3">
            <History className="w-12 h-12 text-sky-300 mx-auto" />
            <h3 className="text-base font-bold text-sky-950">No Past Travel Records</h3>
            <p className="text-xs text-slate-500">
              {searchQuery ? "No travel history matched your search." : "Completed or past trips will appear here automatically."}
            </p>
            <Link
              href="/trips"
              className="inline-block bg-sky-700 hover:bg-sky-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              View Active Trips
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-extrabold text-base text-sky-950 line-clamp-1">{trip.title}</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {trip.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    {trip.destination && (
                      <div className="flex items-center gap-1.5 font-semibold text-sky-700">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{trip.destination.name}, {trip.destination.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{trip.startDate} to {trip.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 text-[11px] font-medium">Logged Journey</span>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Trip Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
