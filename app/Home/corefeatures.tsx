// app/Home/CoreFeatures.tsx

const CoreFeatures = () => {
  return (
    <section id="features" className="py-20 px-6 md:px-12 bg-white border-t">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Core Features of SoccerZone
        </h2>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Everything you need to host or join a football event — structured, simple, and secure.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left text-gray-800 text-base md:text-lg">
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            🧾 <strong className="block text-xl font-semibold mt-2 mb-2">Split Payments</strong>
            Payments are automatically split — 80% to the organizer, 20% to the platform.
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            🎟️ <strong className="block text-xl font-semibold mt-2 mb-2">Digital Tickets</strong>
            Players get QR-based digital passes instantly after payment.
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            🛡️ <strong className="block text-xl font-semibold mt-2 mb-2">Player Verification</strong>
            Event hosts can scan or manually verify each participant on arrival.
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            🏆 <strong className="block text-xl font-semibold mt-2 mb-2">Event Dashboard</strong>
            Organizers get a dashboard to manage events, track payments, and check-in players.
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            📅 <strong className="block text-xl font-semibold mt-2 mb-2">Booking & Scheduling</strong>
            Players can browse by date, time, or location — everything is structured.
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            📈 <strong className="block text-xl font-semibold mt-2 mb-2">Match History</strong>
            Players build a personal match record — like a football resume.
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
