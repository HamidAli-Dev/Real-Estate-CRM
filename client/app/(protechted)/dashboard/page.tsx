import Overview from "../_components/Overview";
import TopBar from "../_components/TopBar";

const DashboardPage = () => {
  return (
    <div>
      <TopBar />
      <div className="p-6">
        <Overview />
      </div>
    </div>
  );
};

export default DashboardPage;
