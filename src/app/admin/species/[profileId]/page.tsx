import Link from "next/link";
import { getProfileWithWorkflow } from "@/server/actions/workflows";
import { WorkflowTemplateForm } from "@/components/WorkflowTemplateForm";
import { WorkflowTaskForm } from "@/components/WorkflowTaskForm";
import { WorkflowTaskRow } from "@/components/WorkflowTaskRow";

export default async function ProfileDetailPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  const profile = await getProfileWithWorkflow(profileId);
  const workflow = profile.workflowTemplates[0];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/species" className="text-sm text-green-700 underline">
          ← Back to species
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-stone-900">
          {profile.varietyBreed.species.commonName} — {profile.varietyBreed.name}
        </h1>
        <p className="text-sm text-stone-500">
          {profile.name} · {profile.method.name}
        </p>
      </div>

      {!workflow ? (
        <WorkflowTemplateForm profileId={profileId} defaultName={profile.varietyBreed.name} />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">
              {workflow.name} · anchor: {workflow.anchorType.toLowerCase().replace("_", " ")}
            </h2>
            <div className="space-y-1">
              {workflow.taskTemplates.map((task) => (
                <WorkflowTaskRow key={task.id} task={task} profileId={profileId} />
              ))}
              {workflow.taskTemplates.length === 0 && <p className="text-sm text-stone-400">No tasks yet.</p>}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-500">Add a task</h2>
            <WorkflowTaskForm workflowTemplateId={workflow.id} profileId={profileId} />
          </div>
        </div>
      )}
    </div>
  );
}
