import Link from "next/link";
import { Plane } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-sky-950 text-sky-300 py-8 px-6 border-t border-sky-900 mt-auto text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <Plane className="w-4 h-4 text-amber-400" />
          <span>TripNest</span>
          <span className="text-sky-500 font-normal">| Travel & Itinerary Platform</span>
        </div>
        <div className="flex items-center gap-6 text-sky-400">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/trips" className="hover:underline">My Trips</Link>
          <Link href="/destinations" className="hover:underline">Destinations</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
        </div>
        <p className="text-sky-500 text-center md:text-right">
          © {new Date().getFullYear()} TripNest. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
