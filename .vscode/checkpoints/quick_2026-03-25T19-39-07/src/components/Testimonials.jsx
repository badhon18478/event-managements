export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Enthusiast',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      content:
        "EventHub has completely changed how I discover events. I've attended amazing concerts and workshops I never would have found otherwise!",
    },
    {
      name: 'Michael Chen',
      role: 'Business Professional',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content:
        'As an event organizer, this platform makes it so easy to reach my target audience. The interface is intuitive and the results are fantastic.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Artist',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      content:
        "I love how diverse the events are! From art exhibitions to tech conferences, there's something for everyone. Highly recommend!",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy users who trust EventHub for their event
            needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
