import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Users, DollarSign, TrendingUp, Eye, CheckCircle, XCircle, Clock,
  Loader2, Search, Filter, ChevronDown, ArrowLeft, ShieldCheck, FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderWithItems {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_reference: string | null;
  payment_receipt_url: string | null;
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  coupon_code: string | null;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  notes: string | null;
  user_id: string;
  order_items: {
    id: string;
    product_name: string;
    product_image: string | null;
    variant_style: string;
    variant_price: number;
    color: string;
    quantity: number;
  }[];
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (!data) {
        setIsAdmin(false);
        toast({ title: 'Access denied', description: 'You do not have admin privileges.', variant: 'destructive' });
        navigate('/');
      } else {
        setIsAdmin(true);
      }
    })();
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as OrderWithItems[]);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    setUpdatingOrderId(orderId);
    const updateData: Record<string, string> = { status };
    if (paymentStatus) updateData.payment_status = paymentStatus;

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Order updated', description: `Order status changed to ${status}.` });
      fetchOrders();
    }
    setUpdatingOrderId(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      payment_failed: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      awaiting_confirmation: 'bg-blue-100 text-blue-800',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.shipping_name.toLowerCase().includes(q) ||
        o.shipping_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    awaitingConfirmation: orders.filter(o => o.payment_status === 'awaiting_confirmation').length,
  };

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-blue-600' },
            { title: 'Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-600' },
            { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600' },
            { title: 'Awaiting Confirmation', value: stats.awaitingConfirmation, icon: FileImage, color: 'text-purple-600' },
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Orders</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{order.shipping_name}</p>
                            <p className="text-xs text-muted-foreground">{order.shipping_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getPaymentBadge(order.payment_status)}
                            <span className="text-xs text-muted-foreground">{order.payment_method}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order {order.id.slice(0, 8).toUpperCase()}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Customer</p>
                                      <p className="font-medium">{order.shipping_name}</p>
                                      <p>{order.shipping_email}</p>
                                      <p>{order.shipping_phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Shipping</p>
                                      <p>{order.shipping_address}</p>
                                      <p>{order.shipping_city}, {order.shipping_state}</p>
                                    </div>
                                  </div>
                                  {order.notes && (
                                    <div className="text-sm">
                                      <p className="text-muted-foreground">Notes</p>
                                      <p>{order.notes}</p>
                                    </div>
                                  )}
                                  <Separator />
                                  <div className="space-y-2">
                                    <p className="font-medium">Items</p>
                                    {order.order_items?.map((item) => (
                                      <div key={item.id} className="flex items-center gap-3 text-sm">
                                        {item.product_image && (
                                          <img src={item.product_image} alt="" className="h-10 w-10 rounded object-cover" />
                                        )}
                                        <div className="flex-1">
                                          <p className="font-medium">{item.product_name}</p>
                                          <p className="text-muted-foreground">{item.variant_style} • {item.color} × {item.quantity}</p>
                                        </div>
                                        <p>{formatPrice(item.variant_price * item.quantity)}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <Separator />
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                                    <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping_fee)}</span></div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between text-gold"><span>Discount {order.coupon_code && `(${order.coupon_code})`}</span><span>-{formatPrice(order.discount)}</span></div>
                                    )}
                                    <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                                  </div>
                                  {order.payment_receipt_url && (
                                    <>
                                      <Separator />
                                      <div>
                                        <p className="text-sm font-medium mb-2">Payment Receipt</p>
                                        <a href={order.payment_receipt_url} target="_blank" rel="noopener noreferrer">
                                          <img src={order.payment_receipt_url} alt="Receipt" className="max-h-48 rounded-lg border object-contain" />
                                        </a>
                                      </div>
                                    </>
                                  )}
                                  <Separator />
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                      {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                        <Button
                                          key={s}
                                          variant={order.status === s ? 'default' : 'outline'}
                                          size="sm"
                                          disabled={updatingOrderId === order.id}
                                          onClick={() => updateOrderStatus(order.id, s)}
                                        >
                                          {s}
                                        </Button>
                                      ))}
                                    </div>
                                    {order.payment_status === 'awaiting_confirmation' && (
                                      <div className="flex gap-2 mt-2">
                                        <Button
                                          variant="gold"
                                          size="sm"
                                          disabled={updatingOrderId === order.id}
                                          onClick={() => updateOrderStatus(order.id, 'confirmed', 'paid')}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" /> Confirm Payment
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          disabled={updatingOrderId === order.id}
                                          onClick={() => updateOrderStatus(order.id, 'payment_failed', 'failed')}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Select
                              value={order.status}
                              onValueChange={(v) => updateOrderStatus(order.id, v)}
                              disabled={updatingOrderId === order.id}
                            >
                              <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
