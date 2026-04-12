import EventDetailsClient from './EventDetailsClient';

// Static params generation for build - REQUIRED for static export
export const dynamic = 'force-static';
export function generateStaticParams() {
  return [];
}

export default function EventDetailsPage({ params }) {
  return <EventDetailsClient params={params} />;
}
