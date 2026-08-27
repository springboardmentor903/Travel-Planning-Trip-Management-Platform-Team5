"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Destination } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Compass, Sparkles, MapPin, Plus, ArrowRight, CloudSun, Calendar } from "lucide-react";

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    api
      .get("/destinations")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDestinations(res.data);
        }
      })
      .catch((err) => console.log("Error loading destinations:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-sky-700 via-sky-800 to-sky-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-sky-600/60 border border-sky-400/40 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" /> Travel Planning & Itinerary Management
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Explore Beautiful Places & Plan Unforgettable Trips
          </h1>

          <p className="text-sm sm:text-base text-sky-100 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one travel companion to discover worldwide destinations, organize day-by-day itineraries, check live weather, and track travel history seamlessly.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-sky-600/80 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm border border-sky-400 transition"
                >
                  Sign In
                </Link>
              </>
            )}
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 bg-sky-950/60 hover:bg-sky-950 text-sky-100 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm border border-sky-700 transition"
            >
              <Compass className="w-4 h-4 text-amber-400" /> Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Travel Destinations */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-sky-950 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-500" /> Featured Travel Destinations
            </h2>
            <p className="text-xs text-slate-500 mt-1">Explore top places recommended by travelers</p>
          </div>

          <Link href="/destinations" className="text-xs font-bold text-sky-700 hover:underline">
            View All Destinations →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-sky-950">{dest.name}</h3>
                    <span className="text-xs text-sky-600 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {dest.country}
                    </span>
                  </div>
                  {dest.isPopular && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                      ★ Popular
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-xs mt-3 mb-4 line-clamp-3 leading-relaxed">
                  {dest.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <CloudSun className="w-4 h-4 text-sky-500" />
                  {dest.weatherInfo || "22°C"}
                </span>

                <Link
                  href={`/destinations/${dest.id}`}
                  className="font-bold text-sky-600 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
