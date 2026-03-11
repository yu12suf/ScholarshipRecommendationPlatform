import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold text-foreground">
            EduPathway
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © 2024 EduPathway Platform. All rights reserved.
        </p>

        {/* Links */}
        <nav className="flex gap-8">

          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            Terms
          </Link>

          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            Privacy
          </Link>

          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            Support
          </Link>

        </nav>

      </div>
    </footer>
  );
}