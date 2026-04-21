import Features from '../components/Features';
import Hero from '../components/Hero';
import PopularEvents from '../components/PopularEvents';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <PopularEvents />
      <Testimonials />
    </main>
  );
}
