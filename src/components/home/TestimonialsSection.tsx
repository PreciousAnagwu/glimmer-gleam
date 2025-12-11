import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Adaeze Okonkwo',
    role: 'Fashion Blogger',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content:
      'The quality of Glamour & Co. jewelry is absolutely stunning. Every piece I\'ve purchased has become a staple in my collection.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Chiamaka Eze',
    role: 'Business Executive',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    content:
      'From engagement rings to everyday accessories, Glamour has never disappointed. The attention to detail is remarkable.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Folake Adeyemi',
    role: 'Wedding Planner',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    content:
      'I recommend Glamour & Co. to all my brides. Their bridal sets are breathtaking and the customer service is exceptional.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join thousands of satisfied customers who trust Glamour & Co. for their jewelry needs
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold">
                  <Quote className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="mt-4 text-muted-foreground">{testimonial.content}</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
