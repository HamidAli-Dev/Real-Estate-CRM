import React from "react";
import { Check } from "lucide-react";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  period: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
  buttonStyle: "primary" | "secondary";
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  className?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  title = "Simple, Transparent Pricing",
  subtitle = "Choose the plan that fits your business needs",
  plans,
  className = "",
}) => {
  const getButtonClasses = (style: "primary" | "secondary") => {
    const baseClasses =
      "w-full py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-center block";

    if (style === "primary") {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
    }
    return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`;
  };

  return (
    <section className={`py-20 bg-gray-50 ${className}`} id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.isPopular
                  ? "border-2 border-blue-500 transform scale-105"
                  : "border border-gray-200"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="text-green-500 mr-3" size={16} />
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <a
                className={getButtonClasses(plan.buttonStyle)}
                href={plan.buttonLink}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "Perfect for individual agents",
    price: 29,
    period: "per user/month",
    features: [
      { text: "Up to 100 properties" },
      { text: "Lead management" },
      { text: "Basic reporting" },
      { text: "Email support" },
      { text: "Mobile app access" },
    ],
    buttonText: "Start Free Trial",
    buttonLink: "/auth/register",
    buttonStyle: "secondary",
  },
  {
    name: "Professional",
    description: "Ideal for growing teams",
    price: 59,
    period: "per user/month",
    isPopular: true,
    features: [
      { text: "Unlimited properties" },
      { text: "Advanced pipeline" },
      { text: "Team collaboration" },
      { text: "Priority support" },
      { text: "Custom integrations" },
      { text: "Advanced analytics" },
    ],
    buttonText: "Start Free Trial",
    buttonLink: "/auth/register",
    buttonStyle: "primary",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 99,
    period: "per user/month",
    features: [
      { text: "Everything in Professional" },
      { text: "Multi-workspace support" },
      { text: "Custom branding" },
      { text: "API access" },
      { text: "Dedicated support" },
      { text: "Advanced security" },
    ],
    buttonText: "Start Free Trial",
    buttonLink: "/auth/register",
    buttonStyle: "secondary",
  },
];
