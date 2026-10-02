import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { PersonasSection } from "@/components/landing/personas-section";
import { StarFrameworkSection } from "@/components/landing/star-framework-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <PersonasSection />
                <StarFrameworkSection />
                <FeaturesSection />
            </main>
            <Footer />
        </div>
    );
}
