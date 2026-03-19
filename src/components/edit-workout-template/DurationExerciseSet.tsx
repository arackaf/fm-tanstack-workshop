import type { FC } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";

type DurationExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DurationExerciseSet: FC<DurationExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="grid grid-cols-[auto_1fr] gap-3 text-sm md:col-span-2 ml-2">
        <div className="h-7 flex items-center">
          <span className="font-medium">Duration</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form.Field
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].duration`}
            validators={{
              onChange: ({ value }) => {
                if (value == null || value === "") {
                  return "Required";
                }
              },
            }}
            children={durationField => (
              <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Input
                  min={0}
                  step="0.01"
                  type="number"
                  value={durationField.state.value ?? ""}
                  onChange={event => {
                    const value = event.target.value;
                    durationField.handleChange(
                      (value === "" ? null : value) as never,
                    );
                  }}
                  className={cn(
                    "h-7 w-24 px-2 py-1",
                    !durationField.state.meta.isValid ? "border-red-500" : "",
                  )}
                />
              </label>
            )}
          />

          <form.Field
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].durationUnit`}
            validators={{
              onChange: ({ value }) => {
                const duration =
                  form.state.values.segments[segmentIndex]?.exercises[
                    exerciseIndex
                  ]?.duration;
                if (duration != null && duration !== "" && value == null) {
                  return "Required";
                }
              },
            }}
            children={durationUnitField => (
              <Select
                value={durationUnitField.state.value ?? undefined}
                onValueChange={value => {
                  durationUnitField.handleChange(value as never);
                }}
              >
                <SelectTrigger className="h-7 w-28">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
};
