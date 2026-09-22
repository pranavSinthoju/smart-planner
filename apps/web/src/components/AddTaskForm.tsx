import { useState } from "react";
import type { SchedulePlacement } from "@smart-planner/shared";
import { useAddTask } from "../hooks";
import { useSpeechRecognition } from "../useSpeechRecognition";

interface AddTaskFormProps {
  onScheduled: (placements: SchedulePlacement[]) => void;
}

export function AddTaskForm({ onScheduled }: AddTaskFormProps) {
  const [text, setText] = useState("");
  const addTask = useAddTask();
  const speech = useSpeechRecognition();

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

  function handleMicClick() {
    if (speech.isListening) {
      speech.stop();
      return;
    }
    setText("");
    speech.start(setText);
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <div className="add-task-input-row">
        <input
          type="text"
          placeholder='Add a task, e.g. "finish the calc problem set, due Thursday"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={addTask.isPending}
        />
        {speech.isSupported && (
          <button
            type="button"
            className={`mic-button${speech.isListening ? " listening" : ""}`}
            onClick={handleMicClick}
            title={speech.isListening ? "Stop listening" : "Add task by voice"}
            aria-label={speech.isListening ? "Stop listening" : "Add task by voice"}
          >
            🎤
          </button>
        )}
      </div>
      <button type="submit" disabled={addTask.isPending || !text.trim()}>
        {addTask.isPending ? "Scheduling…" : "Add"}
      </button>
      {speech.isListening && <p className="listening-indicator">Listening…</p>}
      {speech.error && <p className="form-error">{speech.error}</p>}
      {addTask.isError && <p className="form-error">{(addTask.error as Error).message}</p>}
    </form>
  );
}
