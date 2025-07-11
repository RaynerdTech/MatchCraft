// app/Home/HowItWorks.tsx

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12 bg-gray-50 border-t">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          How SoccerZone Works
        </h2>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Whether you’re a player or an organizer, SoccerZone makes the process simple and smooth.
        </p>

        <div className="grid md:grid-cols-4 gap-8 text-left text-gray-800 text-base md:text-lg">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="font-semibold text-xl mb-2">Discover</h3>
            <p>Find football events near you or browse open matches and tournaments.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <span className="text-4xl mb-3 block">💳</span>
            <h3 className="font-semibold text-xl mb-2">Pay</h3>
            <p>Securely book your slot — we handle the split between organizer & platform.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <span className="text-4xl mb-3 block">🎟️</span>
            <h3 className="font-semibold text-xl mb-2">Get Ticket</h3>
            <p>Receive your digital ticket and QR pass instantly for entry and verification.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <span className="text-4xl mb-3 block">⚽</span>
            <h3 className="font-semibold text-xl mb-2">Play</h3>
            <p>Show up, scan your ticket, and enjoy the beautiful game with no stress.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
