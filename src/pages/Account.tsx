import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useProducts } from '@/hooks/useProducts';
import { Trash2, ShoppingBag } from 'lucide-react';
import { GiftWishlistDialog } from '@/components/wishlist/GiftWishlistDialog';
import { 
  User, 
  Package, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  Mail,
  MapPin,
  Phone,
  Shield,
  Gift,
  Star,
  Clock,
  ChevronRight,
  Edit2,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  payment_method: string;
}

const Account: React.FC = () => {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const { getProductById } = useProducts();
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);

  const tabParam = searchParams.get('tab') || 'profile';
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loyalty, setLoyalty] = useState<{ points_balance: number; lifetime_points: number; referral_code: string } | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Fetch profile data
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfileData(prev => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || '',
        }));
      }
    })();
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, payment_status, total, payment_method')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
      setLoadingOrders(false);
    })();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: profileData.name, phone: profileData.phone })
      .eq('user_id', user.id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setIsEditingProfile(false);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'pending': case 'processing': return 'text-amber-600 bg-amber-100';
      case 'payment_failed': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const notifications = [
    { id: 1, title: 'Order Shipped', message: 'Your order has been shipped.', time: '2 hours ago', read: false },
    { id: 2, title: 'New Arrival', message: 'Check out our new diamond collection!', time: '1 day ago', read: true },
    { id: 3, title: 'Reward Earned', message: 'You earned 500 points from your last purchase.', time: '3 days ago', read: true },
  ];

  // Fetch live loyalty + active published coupons
  useEffect(() => {
    (async () => {
      const nowIso = new Date().toISOString();
      const { data: cps } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false });
      setCoupons(cps || []);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    let channel: any;
    (async () => {
      const { data } = await supabase
        .from('loyalty_points')
        .select('points_balance, lifetime_points, referral_code')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setLoyalty(data);
      // Realtime updates so points reflect immediately
      channel = supabase
        .channel('account-loyalty')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_points', filter: `user_id=eq.${user.id}` }, (payload: any) => {
          if (payload.new) setLoyalty(payload.new);
        })
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Welcome, {user?.name || 'User'}
                  </h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Main Content */}
          <Tabs value={tabParam} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1 bg-muted/50">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /><span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" /><span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /><span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
                <Bell className="h-4 w-4" /><span className="hidden sm:inline">Alerts</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">1</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Gift className="h-4 w-4" /><span className="hidden sm:inline">Coupons</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /><span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                      {isEditingProfile ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} disabled={!isEditingProfile} className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" value={profileData.email} disabled className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} disabled={!isEditingProfile} placeholder="Enter phone number" className="pl-10" />
                      </div>
                    </div>
                    {isEditingProfile && (
                      <Button variant="gold" onClick={handleSaveProfile} className="w-full">
                        <Check className="h-4 w-4 mr-2" />Save Changes
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" />Loyalty Status</CardTitle>
                    <CardDescription>Your rewards and points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <Star className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        {(loyalty?.lifetime_points ?? 0) >= 5000 ? 'Platinum Member' : (loyalty?.lifetime_points ?? 0) >= 2000 ? 'Gold Member' : (loyalty?.lifetime_points ?? 0) >= 500 ? 'Silver Member' : 'Bronze Member'}
                      </h3>
                      <p className="text-muted-foreground mb-1">{(loyalty?.points_balance ?? 0).toLocaleString()} Points Available</p>
                      <p className="text-xs text-muted-foreground mb-4">Lifetime: {(loyalty?.lifetime_points ?? 0).toLocaleString()}</p>
                      {(() => {
                        const lp = loyalty?.lifetime_points ?? 0;
                        const next = lp >= 5000 ? null : lp >= 2000 ? 5000 : lp >= 500 ? 2000 : 500;
                        const prev = lp >= 5000 ? 5000 : lp >= 2000 ? 2000 : lp >= 500 ? 500 : 0;
                        if (!next) return <p className="text-sm text-primary font-medium">You've reached the top tier ✨</p>;
                        const pct = Math.min(100, Math.round(((lp - prev) / (next - prev)) * 100));
                        return (
                          <>
                            <div className="w-full bg-muted rounded-full h-2 mb-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-sm text-muted-foreground">{(next - lp).toLocaleString()} points to next tier</p>
                          </>
                        );
                      })()}
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/rewards')}>View Rewards</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium text-foreground mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Button variant="gold" onClick={() => navigate('/shop')}>Browse Products</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link key={order.id} to={`/track/${order.id}`} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} • {order.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>My Wishlist ({wishlistItems.length})</CardTitle>
                    <CardDescription>Items you've saved for later</CardDescription>
                  </div>
                  {wishlistItems.length > 0 && (
                    <Button variant="gold" size="sm" onClick={() => setGiftDialogOpen(true)}>
                      <Gift className="mr-1 h-4 w-4" /> Send as Gift
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium text-foreground mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground mb-4">Start adding items you love to your wishlist</p>
                      <Button variant="gold" onClick={() => navigate('/shop')}>Browse Products</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {wishlistItems.map((item) => {
                        const product = getProductById(item.productId);
                        return (
                          <div key={item.productId} className="flex gap-4 rounded-lg border border-border p-4">
                            <Link to={`/product/${item.productId}`} className="shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-24 w-24 rounded-md object-cover"
                              />
                            </Link>
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                <Link to={`/product/${item.productId}`}>
                                  <h4 className="font-medium text-foreground hover:text-gold line-clamp-2">
                                    {item.name}
                                  </h4>
                                </Link>
                                <p className="mt-1 text-sm font-semibold text-gold">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="gold"
                                  className="flex-1"
                                  disabled={!product || !product.inStock}
                                  onClick={() => {
                                    if (!product) return;
                                    addToCart({
                                      productId: product.id,
                                      name: product.name,
                                      image: product.images[0],
                                      variant: product.variants[0],
                                      color: product.colors[0].name,
                                      quantity: 1,
                                    });
                                    toast({ title: 'Added to cart', description: product.name });
                                  }}
                                >
                                  <ShoppingBag className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    removeFromWishlist(item.productId);
                                    toast({ title: 'Removed from wishlist', description: item.name });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated with your orders and offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`flex items-start gap-4 p-4 border border-border rounded-lg ${!notification.read ? 'bg-primary/5' : ''}`}>
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-muted'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coupons Tab */}
            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <CardTitle>My Coupons</CardTitle>
                  <CardDescription>Available discount codes</CardDescription>
                </CardHeader>
                <CardContent>
                  {coupons.length === 0 ? (
                    <div className="text-center py-12">
                      <Gift className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium text-foreground mb-1">No discount codes available</h3>
                      <p className="text-sm text-muted-foreground">Check back soon for exclusive offers.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {coupons.map((coupon) => {
                        const discountLabel = coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : formatPrice(Number(coupon.discount_value));
                        return (
                          <div key={coupon.id} className="relative overflow-hidden border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
                            <Gift className="absolute top-2 right-2 h-6 w-6 text-primary/50" />
                            <div className="relative">
                              <p className="font-mono text-lg font-bold text-primary">{coupon.code}</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{discountLabel} OFF</p>
                              {Number(coupon.min_order_amount) > 0 && (
                                <p className="text-sm text-muted-foreground mt-2">Min. order: {formatPrice(Number(coupon.min_order_amount))}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {coupon.expires_at ? `Expires: ${new Date(coupon.expires_at).toLocaleDateString()}` : 'No expiry'}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 w-full"
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  toast({ title: 'Code copied', description: `${coupon.code} copied. Use it at checkout.` });
                                }}
                              >
                                Copy Code
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Change Password</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input id="confirmNewPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                    </div>
                    <Button variant="gold" onClick={handlePasswordChange} disabled={!newPassword || !confirmPassword} className="w-full">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
