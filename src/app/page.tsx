import { Features } from "@/components/homepage/features";
import { FinalCta } from "@/components/homepage/final-cta";
import { Footer } from "@/components/homepage/footer";
import { Header } from "@/components/homepage/header";
import { Hero } from "@/components/homepage/hero";
import { HowItWorks } from "@/components/homepage/how-it-works";
import { SavingsPreview } from "@/components/homepage/savings-preview";
import { Testimonials } from "@/components/homepage/testimonials";
import { ToolLogos } from "@/components/homepage/tool-logos";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ToolLogos />
        <HowItWorks />
        <SavingsPreview />
        <Features />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
