import {
  ChartNoAxesColumn,
  ClipboardCheck,
  House,
  Smartphone,
  User,
  Users,
} from "lucide-react";

const KeyFeatures = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel in Real Estate
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines property management, lead
            nurturing, and team collaboration in one powerful solution.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="p-6 rounded-xl border-2 transition-all cursor-pointer border-blue-500 bg-blue-50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-600 text-white">
                  <House size={17} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Property Management
                  </h3>
                  <p className="text-gray-600">
                    Organize and track all your properties with detailed
                    listings, photos, and status updates.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border-2 transition-all cursor-pointer border-gray-200 bg-white hover:border-gray-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                  <User size={17} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Lead Pipeline
                  </h3>
                  <p className="text-gray-600">
                    Manage your sales funnel with our intuitive Kanban board and
                    automated follow-ups.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border-2 transition-all cursor-pointer border-gray-200 bg-white hover:border-gray-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                  <ClipboardCheck size={17} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Task Management
                  </h3>
                  <p className="text-gray-600">
                    Schedule appointments, set reminders, and never miss an
                    important client interaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={"/images/features.jpg"}
              alt="RealCRM Dashboard"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl w-full object-cover h-96"
            />
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users size={21} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Work seamlessly with your team with shared workspaces and
              real-time updates.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={21} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile Ready
            </h3>
            <p className="text-gray-600">
              Access your CRM anywhere with our responsive design and mobile
              apps.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChartNoAxesColumn size={21} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600">
              Make data-driven decisions with comprehensive reports and
              insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
