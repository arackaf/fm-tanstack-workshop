import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { exercises as exerciseTable, muscleGroup } from "@/drizzle/schema";

type MuscleGroup = typeof muscleGroup.$inferSelect;

export type Exercise = typeof exerciseTable.$inferSelect;

type ExerciseSelectorProps = {
  value: number | null;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  onSelect: (exerciseId: number) => void;
  required?: boolean;
};

type MuscleGroupOption = {
  id: number;
  name: string;
  muscleGroupListLabel: string;
  searchableText: string;
};

export function ExerciseSelector({
  value,
  exercises,
  muscleGroups,
  onSelect,
  required = false,
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const muscleGroupLookup = useMemo(() => {
    return new Map(muscleGroups.map(group => [group.id, group]));
  }, [muscleGroups]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, MuscleGroupOption[]>();

    for (const exercise of exercises) {
      const optionName = exercise.name;
      const normalizedMuscleGroups = exercise.muscleGroups
        .map(group => muscleGroupLookup.get(group)!)
        .filter(group => group)
        .map(
          group =>
            group.name.charAt(0).toLocaleUpperCase() + group.name.slice(1),
        )
        .sort((a, b) => a.localeCompare(b));

      const groupName =
        normalizedMuscleGroups.length > 0
          ? normalizedMuscleGroups.join(", ")
          : "Ungrouped";

      const existingEntries = groups.get(groupName) ?? [];
      existingEntries.push({
        id: exercise.id,
        name: optionName,
        muscleGroupListLabel: groupName,
        searchableText: `${optionName} ${groupName} ${groupName} ${exercise.id}`,
      });
      groups.set(groupName, existingEntries);
    }

    return Array.from(groups.entries())
      .sort(([groupNameA], [groupNameB]) =>
        groupNameA.localeCompare(groupNameB),
      )
      .map(([groupName, groupOptions]) => ({
        groupName,
        options: groupOptions.sort((optionA, optionB) =>
          optionA.name.localeCompare(optionB.name),
        ),
      }));
  }, [exercises, muscleGroupLookup]);

  const selectedOption = exercises.find(exercise => exercise.id === value);
  const selectedLabel = selectedOption
    ? (selectedOption.name ?? `Exercise #${selectedOption.id}`)
    : "Select an exercise";

  return (
    <>
      <input
        required={required}
        value={value ? String(value) : ""}
        readOnly
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="min-w-40 px-2 sm:px-4 max-w-40 sm:min-w-64 sm:max-w-64 justify-between font-normal"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-0 sm:ml-2 size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search exercise or muscle group..." />
            <CommandList>
              <CommandEmpty>No exercises found.</CommandEmpty>
              {groupedOptions.map(group => (
                <CommandGroup key={group.groupName} heading={group.groupName}>
                  {group.options.map(option => {
                    const isSelected = option.id === value;

                    return (
                      <CommandItem
                        key={`${group.groupName}-${option.id}`}
                        value={option.searchableText}
                        onSelect={() => {
                          onSelect(option.id);
                          setIsOpen(false);
                        }}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{option.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {option.muscleGroupListLabel}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
