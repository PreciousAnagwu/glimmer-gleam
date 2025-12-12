import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
  X
} from 'lucide-react';

const Account: React.FC = () => {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 245000,
      items: 3,
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Shipped',
      total: 128000,
      items: 2,
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Processing',
      total: 89000,
      items: 1,
    },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order #ORD-002 has been shipped.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'New Arrival',
      message: 'Check out our new diamond collection!',
      time: '1 day ago',
      read: true,
    },
    {
      id: 3,
      title: 'Reward Earned',
      message: 'You earned 500 points from your last purchase.',
      time: '3 days ago',
      read: true,
    },
  ];

  const coupons = [
    {
      code: 'WELCOME10',
      discount: '10%',
      expiry: '2024-02-28',
      minOrder: 50000,
    },
    {
      code: 'LOYAL20',
      discount: '₦5,000',
      expiry: '2024-03-15',
      minOrder: 100000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Shipped':
        return 'text-blue-600 bg-blue-100';
      case 'Processing':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
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
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1 bg-muted/50">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  1
                </span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Coupons</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditingProfile}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditingProfile}
                          placeholder="Enter phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditingProfile}
                          placeholder="Enter your address"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    {isEditingProfile && (
                      <Button variant="gold" onClick={handleSaveProfile} className="w-full">
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Loyalty Status
                    </CardTitle>
                    <CardDescription>Your rewards and points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <Star className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">Gold Member</h3>
                      <p className="text-muted-foreground mb-4">2,500 Points</p>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        1,500 points until Platinum
                      </p>
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
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items} items • {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              ₦{order.total.toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Items you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Start adding items you love to your wishlist
                    </p>
                    <Button variant="gold" onClick={() => navigate('/shop')}>
                      Browse Products
                    </Button>
                  </div>
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
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 border border-border rounded-lg ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-muted'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
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
                  <div className="grid md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="relative overflow-hidden border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
                        <Gift className="absolute top-2 right-2 h-6 w-6 text-primary/50" />
                        <div className="relative">
                          <p className="font-mono text-lg font-bold text-primary">{coupon.code}</p>
                          <p className="text-2xl font-display font-bold text-foreground my-2">
                            {coupon.discount} OFF
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Min. order: ₦{coupon.minOrder.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {new Date(coupon.expiry).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security
                    </CardTitle>
                    <CardDescription>Manage your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button variant="gold" onClick={handlePasswordChange} className="w-full">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Manage how we contact you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Order updates', description: 'Get notified about your orders' },
                        { label: 'Promotions', description: 'Receive exclusive offers' },
                        { label: 'New arrivals', description: 'Be first to know about new products' },
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{pref.label}</p>
                            <p className="text-sm text-muted-foreground">{pref.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
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
