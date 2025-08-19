import { ChartSpline, House, LucideBadgeDollarSign, User2 } from "lucide-react";
import React from "react";
import Analytics from "./Analytics";

const Overview = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, Sarah Johnson! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Properties
              </p>
              <p className="text-2xl font-bold text-gray-900">247</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+12%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <House className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Leads
              </p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+8%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <User2 className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">23.5%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  +2.1%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <ChartSpline className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">$124,500</p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">+15%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
              <LucideBadgeDollarSign className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      <Analytics />
    </div>
  );
};

export default Overview;
