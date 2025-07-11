// components/HeroSection.tsx
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-white" id="hero">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Text Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Find, Join or Host <span className="text-blue-600">Soccer Games</span> Easily
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            SoccerZone connects footballers and organizers, making it super easy to discover games,
            collect payments, and manage events — all in one place.
          </p>
          <Link
            href="/signin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <Image
            src="/images/undraw_goal_rulh.png"
            alt="Soccer illustration"
            width={500}
            height={500}
            className="w-full max-w-md md:max-w-lg h-auto object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
