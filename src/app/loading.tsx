import { LoadingState } from "@/components/feedback/loading-state";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Loading FlowPilot..." />
    </div>
  );
}
