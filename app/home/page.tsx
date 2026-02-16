import { HomeContentAnimated } from "@/components/home/home-content-animated";
import { EVENTS } from "@/lib/events";

export default function HomePage() {
  return <HomeContentAnimated events={EVENTS} />;
}
