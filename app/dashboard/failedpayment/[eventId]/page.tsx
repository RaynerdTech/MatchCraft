// app/dashboard/failedpayment/[eventId]/page.tsx
import ClientEventPage from './ClientEventPage';

export default function EventPage({ params }: { params: { eventId: string } }) {
  return <ClientEventPage eventId={params.eventId} />;
}
