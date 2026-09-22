import { useState } from "react";
import { useCreateFixedEvent } from "../hooks";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AddFixedEventForm() {
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const createFixedEvent = useCreateFixedEvent();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createFixedEvent.mutate(
      { title: title.trim(), dayOfWeek, startTime, endTime },
      { onSuccess: () => setTitle("") },
    );
  }

  return (
    <form className="add-fixed-event-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Fixed commitment, e.g. Discrete Math Lecture"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
        {DAYS.map((d, i) => (
          <option key={d} value={i}>
            {d}
          </option>
        ))}
      </select>
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <span>to</span>
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      <button type="submit" disabled={createFixedEvent.isPending || !title.trim()}>
        Add
      </button>
    </form>
  );
}
