// app/Home/ProblemSection.tsx
import {
  MapPinIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  UserMinusIcon,
  ChatBubbleBottomCenterTextIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

const problems = [
  {
    icon: <MapPinIcon className="h-8 w-8 text-indigo-500" />,
    text: "Hard to find where to play locally",
  },
  {
    icon: <CalendarDaysIcon className="h-8 w-8 text-indigo-500" />,
    text: "No way to book or reserve a slot online",
  },
  {
    icon: <CreditCardIcon className="h-8 w-8 text-indigo-500" />,
    text: "Payment is scattered — bank transfers, cash, or nothing",
  },
  {
    icon: <UserMinusIcon className="h-8 w-8 text-indigo-500" />,
    text: "People ghost after saying “I’ll show up”",
  },
  {
    icon: (
      <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-indigo-500" />
    ),
    text: "WhatsApp groups with no proper coordination",
  },
  {
    icon: <TicketIcon className="h-8 w-8 text-indigo-500" />,
    text: "No receipts, tickets, or way to track your football life",
  },
];

const ProblemSection = () => {
  return (
    <section id="problems" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Football's Biggest <span className="text-blue-600">Headaches</span>
          </h2>

          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Before SoccerHub, organizing matches was full of frustrations.
            Here's what we fix:
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex items-start space-x-4"
            >
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                {problem.icon}
              </div>
              <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
