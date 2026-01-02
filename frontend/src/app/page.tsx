import Hero from "@/components/Home/hero";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen font-display">
      <Navbar />
      <Hero />
    </div>
  );
}
