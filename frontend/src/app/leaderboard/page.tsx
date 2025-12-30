import react from "react";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/navbar";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen font-manrope">
      <Navbar />
      <Container>
        <div className="flex items-center justify-center min-h-screen text-2xl font-semibold">
          LeaderBoard Page
        </div>
      </Container>
    </div>
  );
}
