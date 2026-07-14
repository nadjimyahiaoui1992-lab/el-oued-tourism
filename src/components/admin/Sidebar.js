"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  MapPinned,
  Hotel,
  UtensilsCrossed,
  HeartPulse,
  FerrisWheel,
  CalendarDays,
  Image,
  Building2,
  Settings,
} from "lucide-react";

const menu = [
  {
    title: "لوحة التحكم",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "الأماكن",
    href: "/admin/places",
    icon: MapPinned,
  },
  {
    title: "الفنادق",
    href: "/admin/hotels",
    icon: Hotel,
  },
  {
    title: "المطاعم",
    href: "/admin/restaurants",
    icon: UtensilsCrossed,
  },
  {
    title: "المرافق الصحية",
    href: "/admin/healthcare",
    icon: HeartPulse,
  },
  {
    title: "أماكن التسلية",
    href: "/admin/entertainment",
    icon: FerrisWheel,
  },
  {
    title: "الفعاليات",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    title: "البلديات",
    href: "/admin/communes",
    icon: Building2,
  },
  {
    title: "معرض الصور",
    href: "/admin/gallery",
    icon: Image,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-teal-900 text-white min-h-screen shadow-xl">

      <div className="p-6 border-b border-teal-700">

        <h1 className="text-2xl font-bold">

          🌴 اكتشف الوادي

        </h1>

        <p className="text-sm text-teal-200 mt-2">

          Discover El Oued

        </p>

      </div>

      <nav className="p-4">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2 hover:bg-teal-700 transition-all"
            >
              <Icon size={20} />

              <span>{item.title}</span>

            </Link>
          );
        })}

      </nav>

    </aside>
  );
}
