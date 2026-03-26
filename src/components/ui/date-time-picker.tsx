import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
  value: Date | string | null | undefined;
  onChange: (value: Date) => void;
  placeholder?: string;
  className?: string;
};

const parseValue = (value: Date | string | null | undefined) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const selectedDate = parseValue(value);

  const upsertDate = (nextDate: Date) => {
    onChange(nextDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate ? "text-muted-foreground" : "",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selectedDate ? format(selectedDate, "PPP p") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => {
            if (!date) {
              return;
            }

            const base = selectedDate ?? new Date();
            const next = new Date(date);
            next.setHours(base.getHours(), base.getMinutes(), 0, 0);
            upsertDate(next);
          }}
          autoFocus
        />
        <div className="border-t p-3">
          <Input
            type="time"
            value={selectedDate ? format(selectedDate, "HH:mm") : ""}
            onChange={event => {
              const [hoursText, minutesText] = event.target.value.split(":");
              const hours = Number(hoursText);
              const minutes = Number(minutesText);
              const base = selectedDate ?? new Date();
              const next = new Date(base);
              next.setHours(hours, minutes, 0, 0);
              upsertDate(next);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
