import TopBar from "../../_components/TopBar";
import UserManagement from "@/app/(protechted)/_components/workspace/UserManagement";

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
