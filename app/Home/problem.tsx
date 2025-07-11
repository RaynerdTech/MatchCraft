// app/Home/ProblemSection.tsx

const ProblemSection = () => {
  return (
    <section id="problems" className="py-16 px-6 md:px-12 bg-white border-t">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          The Real Problems Footballers Face
        </h2>
        <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
          Before SoccerZone, organizing or joining a football match often felt like chaos.
        </p>

        <div className="grid md:grid-cols-2 gap-6 text-left text-gray-800 text-base md:text-lg max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ Hard to find where to play locally
          </div>
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ No way to book or reserve a slot online
          </div>
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ Payment is scattered — bank transfers, cash, or nothing
          </div>
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ People ghost after saying “I’ll show up”
          </div>
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ WhatsApp groups with no proper coordination
          </div>
          <div className="bg-gray-100 rounded-xl p-5 shadow-sm">
            ❌ No receipts, tickets, or way to track your football life
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
