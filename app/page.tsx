import Header from "./Home/header";
import HeroSection from "./Home/hero";
import WhySoccerZone from "./Home/whysoccerzone";
import ProblemSection from "./Home/problem";
import HowItWorks from "./Home/howitworks";
import CoreFeatures from "./Home/corefeatures";
import CallToAction from "./Home/calltoaction";
import Footer from "./Home/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <HeroSection />
      <WhySoccerZone />
      <ProblemSection />
      <HowItWorks />
      <CoreFeatures />
      <CallToAction />
      <Footer />
    </main>
  );
}
