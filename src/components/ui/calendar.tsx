"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean | ((date: Date) => boolean);
}

export function Calendar({
  selected,
  onSelect,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  );

  const days = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDate = (day: Date) => {
    if (isDateDisabled(day)) return;
    onSelect?.(day);
  };

  const isDateDisabled = React.useCallback(
    (date: Date): boolean => {
      if (typeof disabled === "function") return disabled(date);
      return !!disabled;
    },
    [disabled]
  );

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          disabled={typeof disabled === "boolean" && disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={typeof disabled === "boolean" && disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day: string, i: number) => (
          <div key={i} className="text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day: Date, i: number) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const isDisabled = isDateDisabled(day);

          return (
            <Button
              key={i}
              variant={isSelected ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isCurrentDay && !isSelected && "bg-muted",
                isDisabled && "pointer-events-none opacity-50"
              )}
              onClick={() => handleSelectDate(day)}
              disabled={isDisabled}
            >
              {format(day, "d")}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
