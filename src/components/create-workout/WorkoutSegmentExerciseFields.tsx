import { Trash2 } from "lucide-react";

type ExerciseOption = {
  id: number;
  name: string | null;
};

type DraftSegmentExercise = {
  exerciseId: string;
  reps: string;
  repsToFailure: boolean;
};

type WorkoutSegmentExerciseFieldsProps = {
  segmentIndex?: number;
  exerciseIndex: number;
  segmentExercise: DraftSegmentExercise;
  exerciseCountInSegment: number;
  exerciseOptions: ExerciseOption[];
  onExerciseChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRepsToFailureChange: (checked: boolean) => void;
  onRemove: () => void;
};

export function WorkoutSegmentExerciseFields({
  exerciseIndex,
  segmentExercise,
  exerciseCountInSegment,
  exerciseOptions,
  onExerciseChange,
  onRepsChange,
  onRepsToFailureChange,
  onRemove,
}: WorkoutSegmentExerciseFieldsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border/80 bg-background/70 p-3 md:grid-cols-[1.2fr_0.7fr_auto]">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Exercise {exerciseIndex + 1}</span>
        <select
          required
          value={segmentExercise.exerciseId}
          onChange={event => onExerciseChange(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">Select an exercise</option>
          {exerciseOptions.map(option => (
            <option key={option.id} value={String(option.id)}>
              {option.name ?? `Exercise #${option.id}`}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Reps</span>
        <input
          required={!segmentExercise.repsToFailure}
          disabled={segmentExercise.repsToFailure}
          min={1}
          type="number"
          value={segmentExercise.reps}
          onChange={event => onRepsChange(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 disabled:opacity-60"
        />

        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={segmentExercise.repsToFailure}
            onChange={event => onRepsToFailureChange(event.target.checked)}
          />
          Reps to failure
        </label>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onRemove}
          disabled={exerciseCountInSegment === 1}
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>
    </div>
  );
}
