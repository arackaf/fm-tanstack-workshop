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

type DistanceExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DistanceExerciseSet: FC<DistanceExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="grid grid-cols-[auto_1fr] gap-3 text-sm md:col-span-2 ml-2">
        <div className="h-7 flex items-center">
          <span className="font-medium">Distance</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form.Field
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].distance`}
            validators={{
              onChange: ({ value }) => {
                if (value == null || value === "") {
                  return "Required";
                }
              },
            }}
            children={distanceField => (
              <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Input
                  min={0}
                  step="0.01"
                  type="number"
                  value={distanceField.state.value ?? ""}
                  onChange={event => {
                    const value = event.target.value;
                    distanceField.handleChange(
                      (value === "" ? null : value) as never,
                    );
                  }}
                  className={cn(
                    "h-7 w-24 px-2 py-1",
                    !distanceField.state.meta.isValid ? "border-red-500" : "",
                  )}
                />
              </label>
            )}
          />

          <form.Field
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].distanceUnit`}
            validators={{
              onChange: ({ value }) => {
                const distance =
                  form.state.values.segments[segmentIndex]?.exercises[
                    exerciseIndex
                  ]?.distance;
                if (distance != null && distance !== "" && value == null) {
                  return "Required";
                }
              },
            }}
            children={distanceUnitField => (
              <Select
                value={distanceUnitField.state.value ?? undefined}
                onValueChange={value => {
                  distanceUnitField.handleChange(value as never);
                }}
              >
                <SelectTrigger className="h-7 w-28">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="yards">Yards</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                  <SelectItem value="km">Km</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
};
