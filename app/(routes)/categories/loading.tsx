import Container from "@/components/ui/container";
import Skeleton from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <Container>
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading…</span>
      </div>
      <div className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((group) => (
            <div key={group} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Loading;
