import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import home from "../assets/home.png";
import card1 from "../assets/card1.png";
import card2 from "../assets/card2.png";
import card3 from "../assets/card3.png";
import step1 from "../assets/step1.png";
import step2 from "../assets/step2.png";
import step3 from "../assets/step3.png";
import step4 from "../assets/step4.png";
import homebg from "../assets/homebg.png";
import { Link } from "react-router-dom";
export default function Home() {
  return (
    <div className="bg-slate-100">
      <Navbar />

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative w-full min-h-screen text-white overflow-hidden"
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/40" />

        <div className="relative max-w-7xl mx-auto px-6 pt-32 sm:pt-36 pb-20 sm:pb-24 min-h-[80vh] grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 reveal-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs md:text-sm uppercase tracking-[0.12em] text-slate-100">
              National Disaster Response Network
            </p>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight">
              Emergency Coordination
              <span className="block text-cyan-300">Made Clear and Actionable</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed">
              A single operational interface for citizens, NGOs, and government teams to report incidents, prioritize response, and monitor relief progress in real time.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4 sm:items-center">
              <Link
                to="/register"
                className="px-7 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg transition"
              >
                Report an Emergency
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-lg border border-white/35 bg-white/10 hover:bg-white/15 text-white font-semibold transition"
              >
                Access Response Portal
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="text-xs text-slate-300 mt-1">Operational Monitoring</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">87</p>
                <p className="text-xs text-slate-300 mt-1">Open Reports</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">42</p>
                <p className="text-xs text-slate-300 mt-1">Teams Active</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">31</p>
                <p className="text-xs text-slate-300 mt-1">Resolved Today</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 reveal-up-delay">
            <div className="rounded-2xl border border-white/20 bg-white/95 text-slate-900 shadow-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-semibold tracking-wide text-slate-600">LIVE COMMAND STATUS</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Regional Situation Overview</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-600">Critical incidents</p>
                  <p className="text-lg font-semibold text-red-600">12</p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-600">Resources en route</p>
                  <p className="text-lg font-semibold text-blue-700">29</p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-600">Avg assignment time</p>
                  <p className="text-lg font-semibold text-emerald-700">4m 20s</p>
                </div>

                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Response readiness</p>
                  <div className="mt-2 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-[84%] bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">84% of active cases assigned within SLA target.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section
        id="features"
        className="relative py-16 md:py-20"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.96) 100%), url(${homebg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Core Capabilities</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Built for speed, clarity, and coordinated response
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Each module is designed to shorten decision time and improve collaboration between citizens, NGOs, and authorities.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {[
              {
                title: "Emergency Reporting",
                number: "01",
                desc: "Capture location-specific incidents instantly with structured details and priority indicators.",
                img: card1
              },
              {
                title: "NGO Coordination",
                number: "02",
                desc: "Route verified incidents to appropriate teams and keep resources aligned to severity.",
                img: card2
              },
              {
                title: "Government Analytics",
                number: "03",
                desc: "Track response outcomes with live operational metrics for faster, evidence-based decisions.",
                img: card3
              }
            ].map((item, i) => (
              <article
                key={i}
                className="group relative rounded-2xl border border-slate-200 bg-white/95 p-6 min-h-[250px] shadow-sm hover:shadow-xl transition duration-300 hover:-translate-y-1"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82)),url(${item.img}) `,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right -2px bottom -20px",
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
                  {item.number}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{item.desc}</p>
                <div className="mt-6 h-1.5 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-24 transition-all" />
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section
        id="how"
        className="relative py-16 md:py-20 bg-slate-900 text-white"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96), rgba(8,145,178,0.12)), url(${homebg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-100 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-300">Operational Flow</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">How incident response moves from alert to resolution</h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              The workflow is structured to reduce lag, assign responsibility early, and keep every stakeholder synchronized.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Report Incident", subtitle: "Citizen submits verified details", img: step1 },
              { title: "Alert & Assign", subtitle: "System prioritizes and dispatches", img: step2 },
              { title: "NGO Responds", subtitle: "Teams execute relief actions", img: step3 },
              { title: "Govt Monitors", subtitle: "Authorities track live status", img: step4 },
            ].map((step, index) => (
              <article
                key={index}
                className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/15 transition duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-semibold">
                  {index + 1}
                </div>

                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-28 object-contain mt-4"
                />

                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{step.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-16 md:py-20 bg-gradient-to-b from-slate-100 to-slate-200">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-900 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 text-white p-8 md:p-10 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-200">Impact Metrics</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">Measured outcomes from active relief operations</h2>
                <p className="mt-4 text-blue-100 leading-relaxed">
                  Real-time numbers that reflect field activity, volunteer engagement, and response effectiveness.
                </p>
              </div>

              <a
                href="/register"
                className="inline-flex self-start lg:self-auto px-6 py-3 rounded-lg bg-white text-blue-900 font-semibold hover:bg-slate-100 transition"
              >
                Join The Network
              </a>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { value: "1,250+", label: "Incidents Reported" },
                { value: "450+", label: "Volunteers Active" },
                { value: "34", label: "Relief Operations" },
                { value: "84%", label: "SLA Response Readiness" },
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/25 bg-white/10 px-5 py-6">
                  <p className="text-3xl font-bold">{item.value}</p>
                  <p className="mt-1 text-blue-100 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
