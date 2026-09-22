import { useState } from "react";
import type { SchedulePlacement } from "@smart-planner/shared";
import { useAddTask } from "../hooks";

interface AddTaskFormProps {
  onScheduled: (placements: SchedulePlacement[]) => void;
}

export function AddTaskForm({ onScheduled }: AddTaskFormProps) {
  const [text, setText] = useState("");
  const addTask = useAddTask();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addTask.mutate(text.trim(), {
      onSuccess: (placements) => {
        setText("");
        onScheduled(placements);
      },
    });
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder='Add a task, e.g. "finish the calc problem set, due Thursday"'
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={addTask.isPending}
      />
      <button type="submit" disabled={addTask.isPending || !text.trim()}>
        {addTask.isPending ? "Scheduling…" : "Add"}
      </button>
      {addTask.isError && <p className="form-error">{(addTask.error as Error).message}</p>}
    </form>
  );
}
