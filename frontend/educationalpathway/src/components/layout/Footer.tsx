import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full py-12 border-t border-gray-900 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img 
            src="/admas.png" 
            alt="አድማስ Logo" 
            width={24} 
            height={24} 
            className="h-6 w-6 object-contain"
          />
          <span className="text-lg font-semibold text-white">
            አድማስ
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-300">
          © 2026 አድማስ Platform. All rights reserved.
        </p>

        {/* Links */}
        <nav className="flex gap-8">

          <Link
            href="#"
            className="text-sm font-medium text-gray-200 hover:text-primary transition"
          >
            Terms
          </Link>

          <Link
            href="#"
            className="text-sm font-medium text-gray-200 hover:text-primary transition"
          >
            Privacy
          </Link>

          <Link
            href="#"
            className="text-sm font-medium text-gray-200 hover:text-primary transition"
          >
            Support
          </Link>

        </nav>

      </div>
    </footer>
  );
}
