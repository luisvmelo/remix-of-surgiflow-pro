import { Skeleton } from "@opme/components/ui/skeleton";

export const KPISkeleton = () => (
  <div className="kpi-card">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-10 w-28" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-neutral-0 rounded-lg shadow-elevation-1 border border-neutral-200">
    <div className="p-5 border-b border-neutral-200">
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-neutral-0 rounded-lg shadow-elevation-1 border border-neutral-200">
    <div className="p-5 border-b border-neutral-200">
      <Skeleton className="h-5 w-48" />
    </div>
    <div className="p-5">
      <Skeleton className="h-[280px] w-full" />
    </div>
  </div>
);
