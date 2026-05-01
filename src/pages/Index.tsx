import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { SubscriptionPopup } from '@/components/layout/SubscriptionPopup';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandsSection } from '@/components/home/BrandsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { SEO } from '@/components/SEO';

const Index = () => {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: "J's Jewels",
    description: "Handcrafted luxury jewelry and accessories.",
    url: typeof window !== 'undefined' ? window.location.origin : 'https://jsjewels.com',
  };
  return (
    <div className="min-h-screen bg-background">
      <SEO jsonLd={orgJsonLd} />
      <Navbar />
      <main>
        <HeroSection />
        <BrandsSection />
        <CategoriesSection />
        <FeaturedProducts />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
      <SubscriptionPopup />
    </div>
  );
};

export default Index;
