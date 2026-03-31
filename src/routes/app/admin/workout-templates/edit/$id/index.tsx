import { useEffect, useState, type FC } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import type { Exercise } from "@/components/ExerciseSelector";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { Button } from "@/components/ui/button";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import {
  workoutTemplateByIdQueryOptions,
  updateWorkoutTemplate,
} from "@/server-functions/workout-templates";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import type { MuscleGroup } from "@/data/types";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/app/admin/workout-templates/edit/$id/")({
  loader: ({ context, params }) => {
    const workoutTemplateId = Number(params.id);

    if (Number.isNaN(workoutTemplateId)) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(
      workoutTemplateByIdQueryOptions(workoutTemplateId),
    );
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
  notFoundComponent: () => (
    <section>
      <Header title="Workout Template Not Found" />
      <p className="text-muted-foreground">
        Could not find this workout template
      </p>
    </section>
  ),
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Edit Workout Template">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const workoutTemplateId = Number(id);

  const { data: workoutTemplate } = useSuspenseQuery(
    workoutTemplateByIdQueryOptions(workoutTemplateId),
  );

  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  useEffect(() => {
    if (workoutTemplate == null || workoutTemplate.id == null) {
      throw notFound();
    }
  }, [navigate, workoutTemplate]);

  if (workoutTemplate == null || workoutTemplate.id == null) {
    return null;
  }

  return (
    <WorkoutTemplateDetailForm
      workoutTemplate={workoutTemplate}
      exercises={exercises}
      muscleGroups={muscleGroups}
    />
  );
}

type WorkoutTemplateDetailFormProps = {
  workoutTemplate: WorkoutTemplateState;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};

const WorkoutTemplateDetailForm: FC<WorkoutTemplateDetailFormProps> = ({
  workoutTemplate,
  exercises,
  muscleGroups,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutTemplateForm(async state => {
    setIsSaving(true);

    try {
      await updateWorkoutTemplate({
        data: {
          ...state,
          id: workoutTemplate.id,
        },
      });
    } finally {
      setIsSaving(false);
    }
  }, workoutTemplate);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <WorkoutTemplate
        form={form}
        exercises={exercises}
        muscleGroups={muscleGroups}
      />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Update workout template"}
        </Button>
      </div>
    </form>
  );
};
