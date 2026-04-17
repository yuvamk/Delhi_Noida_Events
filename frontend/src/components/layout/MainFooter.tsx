"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full pt-20 pb-10 border-t border-white/5 bg-[#0e0e14] font-inter">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-8 md:px-12 max-w-7xl mx-auto">
        <div className="col-span-1 lg:col-span-1">
          <div className="text-3xl font-black text-white mb-6 font-headline tracking-tight flex items-center gap-2">
            DE·NE<span className="w-2 h-2 bg-secondary rounded-full"></span>
          </div>
          <p className="text-[#acaab3] text-sm mb-8 leading-relaxed max-w-xs">
            The Electric Curator of NCR. We map the cultural heartbeat of the capital region through curated events and stories.
          </p>
          <div className="flex gap-4">
            <Link className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#acaab3] hover:text-white hover:bg-white/10 transition-all" href="#">
              <i className="material-symbols-outlined text-xl">share</i>
            </Link>
            <Link className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#acaab3] hover:text-white hover:bg-white/10 transition-all" href="#">
              <i className="material-symbols-outlined text-xl">camera_alt</i>
            </Link>
            <Link className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#acaab3] hover:text-white hover:bg-white/10 transition-all" href="#">
              <i className="material-symbols-outlined text-xl">alternate_email</i>
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">The Magazine</h4>
          <ul className="space-y-4">
            <li><Link className="text-[#acaab3] hover:text-primary transition-colors text-sm" href="#">Cultural Reports</Link></li>
            <li><Link className="text-[#acaab3] hover:text-primary transition-colors text-sm" href="#">Artist Spotlights</Link></li>
            <li><Link className="text-[#acaab3] hover:text-primary transition-colors text-sm" href="#">The Weekend List</Link></li>
            <li><Link className="text-[#acaab3] hover:text-primary transition-colors text-sm" href="#">Underground Guides</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">Explore</h4>
          <ul className="space-y-4">
            <li><Link className="text-[#acaab3] hover:text-secondary transition-colors text-sm" href="#">Live Concerts</Link></li>
            <li><Link className="text-[#acaab3] hover:text-secondary transition-colors text-sm" href="#">Art Exhibitions</Link></li>
            <li><Link className="text-[#acaab3] hover:text-secondary transition-colors text-sm" href="#">Tech Summits</Link></li>
            <li><Link className="text-[#acaab3] hover:text-secondary transition-colors text-sm" href="#">Culinary Pop-ups</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.2em]">Contact</h4>
          <ul className="space-y-4">
            <li><Link className="text-[#acaab3] hover:text-tertiary transition-colors text-sm" href="#">Submit Event</Link></li>
            <li><Link className="text-[#acaab3] hover:text-tertiary transition-colors text-sm" href="#">Partnerships</Link></li>
            <li><Link className="text-[#acaab3] hover:text-tertiary transition-colors text-sm" href="#">Press Kit</Link></li>
            <li><Link className="text-[#acaab3] hover:text-tertiary transition-colors text-sm" href="#">Careers</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-20 border-t border-white/5 pt-10 text-center px-6">
        <p className="text-[#acaab3] text-xs font-medium tracking-widest">
          © {new Date().getFullYear()} DE·NE EDITORIAL. DESIGNED FOR THE ELECTRIC GENERATION.
        </p>
      </div>
    </footer>
  );
}
