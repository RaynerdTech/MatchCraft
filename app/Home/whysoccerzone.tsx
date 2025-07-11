// app/Home/WhySoccerZone.tsx

const WhySoccerZone = () => {
  return (
    <section id="about" className="py-16 px-6 md:px-12 bg-gray-50 rounded-2xl">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          Why SoccerZone Exists
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          In Nigeria (and beyond), footballers face real challenges:
        </p>

        <ul className="text-left text-gray-800 text-base md:text-lg space-y-2 mb-10 list-disc list-inside max-w-2xl mx-auto">
          <li>Difficulty finding where to play</li>
          <li>No easy way to book or join matches</li>
          <li>Frustration organizing games — players bail, payments are messy</li>
          <li>Just WhatsApp groups and word of mouth — no structure</li>
          <li>No proof of participation — no tickets, no history</li>
        </ul>

        <div className="bg-white p-6 md:p-10 rounded-xl shadow-md text-left max-w-3xl mx-auto">
          <p className="text-gray-800 text-lg md:text-xl italic leading-relaxed">
            “As a developer who loves football, I often struggled to find games to join or players
            to show up when I tried organizing matches. Sometimes I'd rent a pitch, invite friends,
            and end up waiting with only 3 people. Payment was always messy. Players would promise
            to show up, and some wouldn’t.
            <br /><br />
            I realized something was missing — a <strong>platform</strong> that made organizing and
            joining football events as easy as booking a ride or ordering food.
            <br /><br />
            That’s why I built <strong>SoccerZone</strong> — to bring <strong>structure, trust, and ease</strong> into the beautiful game we all love.”
          </p>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            What SoccerZone Solves
          </h3>
          <ul className="grid gap-3 text-left md:grid-cols-2 text-base md:text-lg text-gray-700 max-w-4xl mx-auto">
            <li>✅ Discover and join football events nearby</li>
            <li>✅ Organizers can create, manage, and receive payments</li>
            <li>✅ Automated split payments between organizers and platform</li>
            <li>✅ Digital tickets with QR codes for players</li>
            <li>✅ Player verification & attendance tracking</li>
            <li>✅ Build a match history — keep a record of events joined</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhySoccerZone;
