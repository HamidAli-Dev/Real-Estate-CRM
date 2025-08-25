import { Star } from "lucide-react";
import React from "react";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Real Estate Professionals
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers are saying about RealCRM
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                S
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                <p className="text-sm text-gray-600">Real Estate Manager</p>
                <p className="text-sm text-blue-600">Metro Properties</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              "RealCRM transformed our agency operations. We've increased our
              conversion rate by 35% and our team is more organized than ever"
            </p>
            <div className="flex mt-4">
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                M
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                <p className="text-sm text-gray-600">Agency Owner</p>
                <p className="text-sm text-blue-600">Downtown Realty</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              "The multi-tenant support is perfect for our growing business. We
              can manage multiple locations seamlessly."
            </p>
            <div className="flex mt-4">
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                E
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Emma Rodriguez</h4>
                <p className="text-sm text-gray-600">Senior Agent</p>
                <p className="text-sm text-blue-600">Coastal Properties</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              "The lead pipeline visualization helps me prioritize my time and
              close more deals. It's intuitive and powerful."
            </p>
            <div className="flex mt-4">
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
              <Star
                className="text-yellow-400 text-sm fill-yellow-400"
                size={16}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
