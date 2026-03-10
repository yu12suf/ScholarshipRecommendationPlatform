import Link from 'next/link';
import { Shield, ExternalLink, Globe, Cpu } from 'lucide-react';

export function AdminFooter() {
  return (
    <footer className="w-full py-8 bg-slate-950 border-t border-slate-800 text-slate-500 font-bold text-xs mt-auto">
      <div className="container px-8 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-widest">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span className="uppercase tracking-widest">Node v20.x</span>
          </div>
        </div>

        <p className="order-last md:order-none">
          © 2024 <span className="text-white">EduPathway Root Admin.</span> High Performance Cluster Operations.
        </p>

        <nav className="flex gap-8">
          <Link className="hover:text-white transition-colors flex items-center gap-1.5" href="#">
            Audit Docs <ExternalLink className="h-3 w-3" />
          </Link>
          <Link className="hover:text-white transition-colors flex items-center gap-1.5" href="#">
            Security Protocols <Shield className="h-3 w-3" />
          </Link>
          <Link className="hover:text-white transition-colors flex items-center gap-1.5" href="#">
            Global Latency <Globe className="h-3 w-3" />
          </Link>
        </nav>
      </div>
    </footer>
  );
}
