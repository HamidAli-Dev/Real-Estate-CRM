import TopBar from "../../_components/TopBar";
import UserManagement from "@/app/(protechted)/_components/workspace/UserManagement";

const UserManagementPage = () => {
  return (
    <div>
      <TopBar />
      <div className="">
        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;
