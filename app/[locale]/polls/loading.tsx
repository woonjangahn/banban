import { Skeleton } from "@/components/ui/skeleton";

export default function PollsLoading() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">
        <Skeleton className="h-8 w-40" />
      </h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="space-y-2">
              {Array(3).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}