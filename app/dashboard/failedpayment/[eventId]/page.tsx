import ClientEventPage from './ClientEventPage';

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  return <ClientEventPage eventId={params.eventId} />;
}
