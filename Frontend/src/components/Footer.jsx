export default function Footer() {
  return (
    <footer className="mt-0 bg-slate-950 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold tracking-tight">ReliefConnect</h3>
            <p className="mt-4 text-slate-300 max-w-xl leading-relaxed">
              A unified disaster-response platform connecting citizens, NGOs, and public agencies for faster reporting, coordinated action, and measurable impact.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">24/7 Monitoring</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">Priority Dispatch</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">Live Coordination</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-300">Quick Links</h4>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li><a href="#home" className="hover:text-white transition">Home</a></li>
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#how" className="hover:text-white transition">How It Works</a></li>
              <li><a href="/register" className="hover:text-white transition">Get Started</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-300">Contact</h4>
            <div className="mt-4 space-y-3 text-slate-300 text-sm">
              <p>Emergency Coordination Desk</p>
              <p>support@reliefconnect.org</p>
              <p>+91 1800-000-000</p>
              <p className="text-slate-400">Available for urgent operational support.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm text-slate-400">
          <p>© 2026 ReliefConnect. All rights reserved.</p>
          <p>Built for resilient and coordinated disaster response.</p>
        </div>
      </div>
    </footer>
  );
}
