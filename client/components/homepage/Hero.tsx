import { Check, PlayCircle } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-20"
      style={{
        backgroundImage: "url('/images/hero-bg-pattern.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/80"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-3xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Real Estate Business with
              <span className="text-blue-600"> Smart CRM</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Manage properties, nurture leads, and close more deals with our
              comprehensive real estate management platform. Built for modern
              agencies and ambitious agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center"
                href="/auth/register"
              >
                Start Free 14-Day Trial
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center">
                <PlayCircle size={16} className="mr-2" /> Watch Demo
              </button>
            </div>
            <div className="flex items-center mt-8 space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="text-green-500 mr-2" size={14} />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="text-green-500 mr-2" size={14} />
                Setup in 5 minutes
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={"/images/demo.jpg"}
              alt="RealCRM Dashboard"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
