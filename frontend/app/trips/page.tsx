"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Trip } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Search, Calendar, MapPin, Eye, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api.get("/trips/my-trips");
      if (Array.isArray(res.data)) {
        setTrips(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load trips. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete trip.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.destination?.name && trip.destination.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ONGOING":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-950">My Travel Trips</h1>
            <p className="text-xs text-slate-500 mt-1">Manage and organize all your upcoming and past itineraries</p>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create New Trip
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by trip title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {["ALL", "PLANNED", "ONGOING", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  statusFilter === status
                    ? "bg-sky-700 text-white border-sky-700"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={fetchTrips} className="underline font-bold">Retry</button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-sky-100 shadow-sm max-w-lg mx-auto my-8">
            <Calendar className="w-12 h-12 text-sky-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-sky-950 mb-1">No Trips Found</h3>
            <p className="text-xs text-slate-500 mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "No trips matched your search filter."
                : "You haven't created any travel itineraries yet."}
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" /> Start Planning Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-lg text-sky-950 line-clamp-1">{trip.title}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                      {trip.destination && (
                        <div className="flex items-center gap-1.5 font-medium text-sky-700">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span>{trip.destination.name}, {trip.destination.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>
                          {trip.startDate} to {trip.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="flex items-center gap-1 text-sky-600 hover:text-sky-800 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/trips/${trip.id}/edit`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition"
                        title="Edit Trip"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        disabled={deletingId === trip.id}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition"
                        title="Delete Trip"
                      >
                        {deletingId === trip.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
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
