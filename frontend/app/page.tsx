import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--kidos-purple)] px-3 py-4 font-sans text-[var(--kidos-ink)] sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border-4 border-[var(--kidos-orange)] bg-white px-4 py-4 shadow-2xl shadow-[rgba(33,13,94,0.35)] sm:rounded-[30px] sm:px-8 sm:py-7">
        <Navbar />
        <Hero />
        <Features />
        <Faq />
        <Footer />
      </div>
    </main>
  );
}
