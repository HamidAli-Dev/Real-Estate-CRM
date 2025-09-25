import TopBar from "../../_components/TopBar";
import WorkspaceSettings from "@/app/(protechted)/_components/workspace/WorkspaceSettings";

const WorkspaceSettingsPage = () => {
  return (
    <div>
      <TopBar />
      <div className="">
        <WorkspaceSettings />
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
