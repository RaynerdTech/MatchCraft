// app/Home/CallToAction.tsx

import Link from 'next/link';

const CallToAction = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-blue-600 text-white text-center rounded-t-3xl">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Play Smarter Football?
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Join thousands of players and organizers using SoccerZone to connect, play, and manage games — the easy way.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-white text-blue-600 px-8 py-3 text-lg font-semibold rounded-full hover:bg-gray-100 transition"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
