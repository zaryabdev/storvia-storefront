import Container from "@/components/ui/container";
import Skeleton from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <Container>
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading…</span>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="w-full aspect-[16/9] rounded-xl sm:aspect-[21/9] md:aspect-[3/1]" />
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="mb-4 flex gap-2 overflow-hidden p-1">
          <Skeleton className="h-11 w-24 flex-none rounded-full" />
          <Skeleton className="h-11 w-20 flex-none rounded-full" />
          <Skeleton className="h-11 w-28 flex-none rounded-full" />
        </div>
        <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
          <div className="hidden lg:block space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-11 w-28 rounded-xl" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Loading;
