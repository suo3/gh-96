
import { Skeleton } from "@/components/ui/skeleton";

export const ItemCardSkeleton = () => (
  <div className="bg-white rounded-lg border p-4 space-y-3">
    <Skeleton className="h-48 w-full rounded-md" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

export const ItemListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ItemCardSkeleton key={i} />
    ))}
  </div>
);

export const MessageSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-xs p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3 mt-1" />
        </div>
      </div>
    ))}
  </div>
);
