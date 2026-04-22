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
export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen text-white overflow-hidden "
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // clipPath:
          //   "polygon(0 0, 100% 0, 100% 95%, 77% 90%, 50% 90%, 25% 94%, 0 88%)",
        }}>


        <div id="home" className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-10 min-h-[80vh]">

          {/* Left */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Connecting People <br />
              During Disasters
            </h1>

            <p className="mt-4 text-lg text-blue-100">
              Real-time disaster reporting, NGO coordination and
              government response in one unified platform.
            </p>

            <div className="mt-6 flex gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105 hover:shadow-xl">
                🚨 Report Emergency
              </button>

              <button className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 hover:shadow-xl">
                Join as Volunteer
              </button>
            </div>
          </div>

        </div>
      </section >
      {/* FEATURES */}
      <section  id="features" className="bg-white py-20" style={{
        backgroundImage: `url(${homebg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Key Features
        </h2>

        <div  className="  max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6 hover:shadow-xl transition">
          {[
            {
              title: "Emergency Reporting",
              icon: "🚨",
              desc: "Citizens can instantly report disasters and emergencies.",
              img: card1
            },
            {
              title: "NGO Coordination",
              icon: "🤝",
              desc: "NGOs receive prioritized tasks and manage resources efficiently.",
              img: card2
            },
            {
              title: "Government Analytics",
              icon: "📊",
              desc: "Real-time analytics helps authorities take quick decisions.",
              img: card3
            }
          ].map((item, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-6 shadow-lg overflow-hidden hover:scale-105 transition duration-300"
              style={{
                backgroundImage: `url(${item.img})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right bottom",
              }}
            >

              {/* Content */}
              <div className="relative z-10">
                <div className="text-3xl mb-3">{item.icon}</div>

                <h3 className="text-xl font-semibold mb-2 text-black">
                  {item.title}
                </h3>

                <p className="text-black font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="bg-white py-16 opacity-0 translate-y-10 animate-fadeIn" style={{
        backgroundImage: `url(${homebg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      >
        <h2 className="text-3xl font-bold text-center mb-10">
         How It Works 
        </h2>




        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6 text-center">
          {[
            { title: "Report Incident", img: step1 },
            { title: "Alert & Assign", img: step2 },
            { title: "NGO Responds", img: step3 },
            { title: "Govt Monitors", img: step4 },
          ].map((step, index) => (
            <div key={index} className="relative bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:scale-105">

              {/* Image */}
              <img
                src={step.img}
                alt={step.title}
                className="w-full h-40 object-contain mb-4"
              />

              {/* Step Number */}
              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-semibold">
                {index + 1}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-800">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 opacity-0 translate-y-10 animate-fadeIn">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">

          <div>
            <h2 className="text-3xl font-bold">1,250+</h2>
            <p className="text-blue-200">Incidents Reported</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">450+</h2>
            <p className="text-blue-200">Volunteers Active</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">34</h2>
            <p className="text-blue-200">Relief Operations</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
