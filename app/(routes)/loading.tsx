import Container from "@/components/ui/container";
import Skeleton from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <Container>
      <div className="flex flex-col gap-y-12 pb-10 lg:gap-y-16" role="status" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 items-center gap-6 rounded-surface bg-surface-tint p-5 min-[360px]:grid-cols-[3fr_2fr] min-[360px]:gap-4 sm:p-8 md:gap-10 md:p-10 lg:p-12">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-white/60" />
              <Skeleton className="h-12 w-full rounded-full bg-white/60" />
            </div>
            <Skeleton className="aspect-[16/9] rounded-control bg-white/60 min-[360px]:aspect-[4/5] md:aspect-[4/3]" />
          </div>
        </div>

        <div className="flex flex-col gap-y-12 px-4 sm:px-6 lg:gap-y-16 lg:px-8">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-3 overflow-hidden p-1">
              <Skeleton className="h-14 w-[8.5rem] flex-none rounded-xl sm:w-40" />
              <Skeleton className="h-14 w-[8.5rem] flex-none rounded-xl sm:w-40" />
              <Skeleton className="h-14 w-[8.5rem] flex-none rounded-xl sm:w-40" />
              <Skeleton className="h-14 w-[8.5rem] flex-none rounded-xl sm:w-40" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-56" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
