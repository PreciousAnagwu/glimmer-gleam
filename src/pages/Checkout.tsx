import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, CreditCard, Building2, Upload, Tag, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DELIVERY_LOCATIONS = [
  { id: 'lagos-island', name: 'Lagos Island', fee: 2500 },
  { id: 'lagos-mainland', name: 'Lagos Mainland', fee: 3000 },
  { id: 'lekki-ajah', name: 'Lekki / Ajah', fee: 3500 },
  { id: 'ikeja', name: 'Ikeja & Environs', fee: 2800 },
  { id: 'abuja', name: 'Abuja (FCT)', fee: 5000 },
  { id: 'port-harcourt', name: 'Port Harcourt', fee: 5500 },
  { id: 'other', name: 'Other Locations', fee: 6000 },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    notes: '',
  });

  const subtotal = getTotalPrice();
  const shippingFee = DELIVERY_LOCATIONS.find(l => l.id === selectedLocation)?.fee || 0;
  const discountAmount = couponApplied ? Math.round(subtotal * discount) : 0;
  const total = subtotal - discountAmount + shippingFee;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'GLAMOUR15') {
      setDiscount(0.15);
      setCouponApplied(true);
      toast({ title: 'Coupon applied!', description: '15% discount applied to your order.' });
    } else if (code === 'WELCOME10') {
      setDiscount(0.10);
      setCouponApplied(true);
      toast({ title: 'Coupon applied!', description: '10% discount applied to your order.' });
    } else {
      toast({ title: 'Invalid coupon', description: 'This coupon code is not valid.', variant: 'destructive' });
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setOrderPlaced(true);
    clearCart();
  };

  const isShippingValid =
    shippingInfo.firstName && shippingInfo.lastName && shippingInfo.email &&
    shippingInfo.phone && shippingInfo.address && selectedLocation;

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20">
          <div className="rounded-full bg-secondary p-6">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add items to your cart before checking out.</p>
          <Button variant="gold" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="rounded-full bg-gold/20 p-6"
          >
            <CheckCircle2 className="h-16 w-16 text-gold" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
            <h1 className="font-display text-3xl font-bold">Order Placed Successfully!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We'll send a confirmation to your email.
            </p>
          </motion.div>
          <div className="flex gap-4">
            <Button variant="gold" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/account">View Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 bg-gradient-luxury">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  onClick={() => s.num < step && setStep(s.num)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step >= s.num
                      ? 'bg-gold text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </button>
                <span className={`hidden text-sm font-medium sm:inline ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className={`h-px w-8 sm:w-16 ${step > s.num ? 'bg-gold' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <div className="space-y-6 rounded-xl border border-border bg-background p-6 shadow-soft">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-gold" />
                      <h2 className="font-display text-xl font-semibold">Shipping Information</h2>
                    </div>

                    {!isAuthenticated && (
                      <div className="rounded-lg bg-gold/10 p-4 text-sm">
                        <p>Already have an account? <Link to="/auth" className="font-semibold text-gold underline">Log in</Link> for a faster checkout.</p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" value={shippingInfo.firstName} onChange={e => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))} placeholder="Jane" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" value={shippingInfo.lastName} onChange={e => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" value={shippingInfo.email} onChange={e => setShippingInfo(prev => ({ ...prev, email: e.target.value }))} placeholder="jane@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" type="tel" value={shippingInfo.phone} onChange={e => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))} placeholder="+234 800 000 0000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input id="address" value={shippingInfo.address} onChange={e => setShippingInfo(prev => ({ ...prev, address: e.target.value }))} placeholder="123 Example Street, Suite 4" />
                    </div>

                    <div className="space-y-3">
                      <Label>Delivery Location *</Label>
                      <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation} className="grid gap-2 sm:grid-cols-2">
                        {DELIVERY_LOCATIONS.map(loc => (
                          <div key={loc.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${selectedLocation === loc.id ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                            <RadioGroupItem value={loc.id} id={loc.id} />
                            <Label htmlFor={loc.id} className="flex flex-1 cursor-pointer items-center justify-between">
                              <span className="text-sm">{loc.name}</span>
                              <span className="text-sm font-semibold text-gold">{formatPrice(loc.fee)}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (optional)</Label>
                      <Input id="notes" value={shippingInfo.notes} onChange={e => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))} placeholder="Special delivery instructions..." />
                    </div>

                    <Button variant="gold" className="w-full" size="lg" disabled={!isShippingValid} onClick={() => setStep(2)}>
                      Continue to Payment
                    </Button>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <div className="space-y-6 rounded-xl border border-border bg-background p-6 shadow-soft">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gold" />
                      <h2 className="font-display text-xl font-semibold">Payment Method</h2>
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${paymentMethod === 'paystack' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label htmlFor="paystack" className="flex flex-1 cursor-pointer items-center gap-3">
                          <CreditCard className="h-5 w-5 text-gold" />
                          <div>
                            <p className="font-medium">Pay with Paystack</p>
                            <p className="text-sm text-muted-foreground">Card, Bank Transfer, USSD, Mobile Money</p>
                          </div>
                        </Label>
                      </div>

                      <div className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${paymentMethod === 'bank-transfer' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex flex-1 cursor-pointer items-center gap-3">
                          <Building2 className="h-5 w-5 text-gold" />
                          <div>
                            <p className="font-medium">Direct Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">Transfer to our bank account & upload receipt</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'bank-transfer' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-lg border border-border bg-secondary/50 p-4">
                        <h3 className="mb-2 font-semibold">Bank Account Details</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Bank:</span> <span className="font-medium">GTBank</span></p>
                          <p><span className="text-muted-foreground">Account Name:</span> <span className="font-medium">Glamour & Co. Ltd</span></p>
                          <p><span className="text-muted-foreground">Account Number:</span> <span className="font-medium">0123456789</span></p>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label>Upload Payment Receipt</Label>
                          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-gold/50">
                            <div className="text-center">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button variant="gold" onClick={() => setStep(3)} className="flex-1">
                        Review Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6 rounded-xl border border-border bg-background p-6 shadow-soft">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-gold" />
                      <h2 className="font-display text-xl font-semibold">Review Your Order</h2>
                    </div>

                    {/* Shipping Summary */}
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Shipping Details</h3>
                        <button onClick={() => setStep(1)} className="text-sm font-medium text-gold underline">Edit</button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                        <p>{shippingInfo.email} • {shippingInfo.phone}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{DELIVERY_LOCATIONS.find(l => l.id === selectedLocation)?.name}</p>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Payment Method</h3>
                        <button onClick={() => setStep(2)} className="text-sm font-medium text-gold underline">Edit</button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {paymentMethod === 'paystack' ? 'Paystack (Card / Bank Transfer / USSD)' : 'Direct Bank Transfer'}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">Items ({items.length})</h3>
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.variant.style} • {item.color} • Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gold">{formatPrice(item.variant.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        variant="gold"
                        size="lg"
                        className="flex-1"
                        disabled={isProcessing}
                        onClick={handlePlaceOrder}
                      >
                        {isProcessing ? 'Processing...' : `Place Order — ${formatPrice(total)}`}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6 rounded-xl border border-border bg-background p-6 shadow-soft">
                <h2 className="font-display text-lg font-semibold">Order Summary</h2>

                {/* Items Preview */}
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium leading-tight">{item.name}</p>
                        <p className="text-muted-foreground">{item.variant.style}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.variant.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon */}
                <div>
                  {couponApplied ? (
                    <div className="flex items-center justify-between rounded-lg bg-gold/10 p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gold" />
                        <span className="text-sm font-medium">{couponCode.toUpperCase()}</span>
                        <span className="text-sm text-gold">-{discount * 100}%</span>
                      </div>
                      <button onClick={removeCoupon}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-gold">
                      <span>Discount ({discount * 100}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingFee > 0 ? formatPrice(shippingFee) : 'Select location'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Secure checkout</div>
                  <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free shipping over ₦50,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
