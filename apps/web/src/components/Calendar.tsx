import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import type { EventDropArg, EventInput } from "@fullcalendar/core";
import type { FixedEvent, Task } from "@smart-planner/shared";
import { FIXED_EVENT_COLOR, PRIORITY_COLORS } from "../priorityColors";
import { useMoveTask } from "../hooks";

interface CalendarProps {
  fixedEvents: FixedEvent[];
  tasks: Task[];
}

export function Calendar({ fixedEvents, tasks }: CalendarProps) {
  const moveTask = useMoveTask();

  const fixedEventInputs: EventInput[] = fixedEvents.map((fe) => ({
    id: `fixed-${fe.id}`,
    title: fe.title,
    daysOfWeek: [fe.dayOfWeek],
    startTime: fe.startTime,
    endTime: fe.endTime,
    editable: false,
    backgroundColor: FIXED_EVENT_COLOR.bg,
    borderColor: FIXED_EVENT_COLOR.border,
    extendedProps: { kind: "fixed" },
  }));

  const taskEventInputs: EventInput[] = tasks
    .filter((t) => t.status === "SCHEDULED" && t.scheduledStart && t.scheduledEnd)
    .map((t) => {
      const colors = PRIORITY_COLORS[t.priority];
      return {
        id: t.id,
        title: t.name,
        start: t.scheduledStart!,
        end: t.scheduledEnd!,
        editable: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: { kind: "task" },
      };
    });

  function handleDrop(info: EventDropArg | EventResizeDoneArg) {
    if (info.event.extendedProps.kind !== "task" || !info.event.start || !info.event.end) return;
    moveTask.mutate(
      {
        taskId: info.event.id,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      },
      { onError: () => info.revert() },
    );
  }

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      nowIndicator
      allDaySlot={false}
      height="auto"
      editable
      events={[...fixedEventInputs, ...taskEventInputs]}
      eventDrop={handleDrop}
      eventResize={handleDrop}
    />
  );
}
