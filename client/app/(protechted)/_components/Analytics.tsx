import { Check, Eye, PhoneCall, Trophy, UserPlus2 } from "lucide-react";
import React from "react";

const Analytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics Overview
              </h3>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button className="px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap text-gray-600 hover:text-gray-900">
                  Lead Funnel
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap bg-white text-blue-600 shadow-sm">
                  Monthly Sales
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Monthly Sales Performance
              </h4>
              <div className="grid grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 77.1429px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">Jan</div>
                  <div className="text-sm font-semibold text-gray-900">45</div>
                  <div className="text-xs text-gray-500">$89k</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 89.1429px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">Feb</div>
                  <div className="text-sm font-semibold text-gray-900">52</div>
                  <div className="text-xs text-gray-500">$102k</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 82.2857px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">Mar</div>
                  <div className="text-sm font-semibold text-gray-900">48</div>
                  <div className="text-xs text-gray-500">$95k</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 104.571px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">Apr</div>
                  <div className="text-sm font-semibold text-gray-900">61</div>
                  <div className="text-xs text-gray-500">$118k</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 94.2857px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">May</div>
                  <div className="text-sm font-semibold text-gray-900">55</div>
                  <div className="text-xs text-gray-500">$107k</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <div
                      className="bg-blue-600 rounded-t-md mx-auto transition-all duration-300"
                      //   style="height: 114.857px; width: 24px;"
                    ></div>
                    <div
                      className="bg-gray-200 rounded-b-md mx-auto"
                      //   style="height: 4px; width: 24px;"
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">Jun</div>
                  <div className="text-sm font-semibold text-gray-900">67</div>
                  <div className="text-xs text-gray-500">$125k</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Common tasks and shortcuts
            </p>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer whitespace-nowrap bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <i className="ri-home-add-line text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Add Property</h4>
                  <p className="text-sm text-gray-600">List a new property</p>
                </div>
                <i className="ri-arrow-right-line text-lg"></i>
              </div>
            </button>
            <button className="w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer whitespace-nowrap bg-green-50 border-green-200 text-green-600 hover:bg-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <i className="ri-user-add-line text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Add Lead</h4>
                  <p className="text-sm text-gray-600">Create new lead</p>
                </div>
                <i className="ri-arrow-right-line text-lg"></i>
              </div>
            </button>
            <button className="w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer whitespace-nowrap bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <i className="ri-calendar-event-line text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Schedule Task</h4>
                  <p className="text-sm text-gray-600">Plan follow-up</p>
                </div>
                <i className="ri-arrow-right-line text-lg"></i>
              </div>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                  <UserPlus2 size={15} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New lead from contact form
                  </p>
                  <p className="text-sm text-gray-600">
                    Michael Chen - Luxury Apartment
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                  <Check size={15} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Property status updated
                  </p>
                  <p className="text-sm text-gray-600">Downtown Condo - Sold</p>
                  <p className="text-xs text-gray-500 mt-1">12 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                  <PhoneCall size={15} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Follow-up call scheduled
                  </p>
                  <p className="text-sm text-gray-600">
                    Sarah Wilson - Tomorrow 2:00 PM
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-100 text-orange-600">
                  <Trophy size={15} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Deal closed successfully
                  </p>
                  <p className="text-sm text-gray-600">
                    Garden Villa - $450,000
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
                  <Eye size={15} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Property viewing booked
                  </p>
                  <p className="text-sm text-gray-600">
                    Modern Loft - Next Monday
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
