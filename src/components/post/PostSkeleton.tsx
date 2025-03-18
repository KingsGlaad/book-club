// components/post/PostSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function PostSkeleton() {
  return (
    <div className="rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-4 flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />

        <Skeleton className="h-48 w-full rounded-md mb-4" />

        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <div className="px-4 py-2 flex justify-between border-t border-gray-100 dark:border-gray-800">
        <div className="flex space-x-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  );
}
