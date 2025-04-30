import { Skeleton } from "@/components/ui/skeleton";

export default function PollDetailLoading() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Poll header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        {/* Poll options */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        
        {/* Poll stats */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Comments section */}
        <div className="space-y-4 mt-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          
          {/* Comment items */}
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}