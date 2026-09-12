import { useQuery } from "@tanstack/react-query";

async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("API not reachable");
  return res.json();
}

export default function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Smart Weekly Planner</h1>
      <p>API status: {isLoading ? "checking…" : isError ? "unreachable" : data?.status}</p>
    </div>
  );
}
