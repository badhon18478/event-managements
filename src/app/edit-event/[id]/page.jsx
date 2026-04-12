import EditEventClient from './EditEventClient';

// 🔥 এই ফাংশনটি MUST থাকতে হবে - এটি build time এ কাজ করে
export const dynamic = 'force-static';
export function generateStaticParams() {
  return [];
}
export default function EditEventPage({ params }) {
  return <EditEventClient params={params} />;
}
