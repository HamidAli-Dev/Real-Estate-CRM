import TopBar from "../../_components/TopBar";
import UserManagement from "@/components/workspace/UserManagement";

const UserManagementPage = () => {
  return (
    <div>
      <TopBar />
      <div className="p-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;
