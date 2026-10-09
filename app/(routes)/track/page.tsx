import type { Metadata } from "next";

import Container from "@/components/ui/container";

import TrackForm from "./components/track-form";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Track your order",
};

interface TrackPageProps {
  searchParams: {
    order?: string | string[];
  };
}

const TrackPage: React.FC<TrackPageProps> = ({ searchParams }) => {
  const order = Array.isArray(searchParams.order) ? searchParams.order[0] : searchParams.order;

  return (
    <div className="bg-background">
      <Container>
        <div className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-heading text-foreground">Track your order</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Enter your order number and the phone number you used at checkout.
          </p>
          <TrackForm initialOrder={(order ?? "").slice(0, 64)} />
        </div>
      </Container>
    </div>
  );
};

export default TrackPage;
