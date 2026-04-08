import { WorkspaceApp } from '@/components/workspace-app';

export default function RoleWorkspacePage({ params }: { params: { roleId: string } }) {
  return <WorkspaceApp initialRoleId={params.roleId} />;
}
