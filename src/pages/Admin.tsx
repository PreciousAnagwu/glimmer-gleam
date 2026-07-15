import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Users, DollarSign, TrendingUp, Eye, CheckCircle, XCircle, Clock,
  Loader2, Search, Filter, ChevronDown, ArrowLeft, ShieldCheck, FileImage, ShoppingBag, Tag, MessageCircle, Mail, Trash2, Star, FileText, LayoutGrid
} from 'lucide-react';
import { Users as UsersIcon } from 'lucide-react';
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
import { AdminProductManager } from '@/components/admin/AdminProductManager';
import { AdminCouponManager } from '@/components/admin/AdminCouponManager';
import { AdminQAManager } from '@/components/admin/AdminQAManager';
import { AdminNewsletterManager } from '@/components/admin/AdminNewsletterManager';
import { AdminRewardsManager } from '@/components/admin/AdminRewardsManager';
import { AdminContentManager } from '@/components/admin/AdminContentManager';
import { AdminCategoryManager } from '@/components/admin/AdminCategoryManager';
import { AdminUsersManager } from '@/components/admin/AdminUsersManager';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

import { Printer, Truck } from 'lucide-react';

function printPackingSlip(order: any) {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return;
  const html = `<!doctype html><html><head><title>Packing Slip ${order.id.slice(0,8)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>@media print{@page{size:A4;margin:0}body{margin:0}}</style>
    </head><body></body></html>`;
  w.document.write(html);
  w.document.close();
  // Render slip into the new window using simple HTML mirror
  const totalQty = order.order_items?.reduce((s:number,i:any)=>s+i.quantity,0)||0;
  w.document.body.innerHTML = `
    <div style="padding:32px;font-family:Arial,sans-serif;color:#000;max-width:210mm;margin:auto">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:20px">
        <div><h1 style="margin:0;font-size:24px">J's Jewels</h1><p style="margin:0;font-size:11px;color:#666">Packing Slip</p></div>
        <div style="text-align:right;font-size:11px">
          <p style="margin:2px 0"><b>Order:</b> #${order.id.slice(0,8).toUpperCase()}</p>
          <p style="margin:2px 0"><b>Date:</b> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p style="margin:2px 0"><b>Items:</b> ${totalQty}</p>
        </div>
      </div>
      ${order.is_gift?`<div style="border:2px dashed #f43f5e;background:#fff1f2;padding:14px;border-radius:6px;margin-bottom:20px">
        <p style="margin:0;font-weight:bold">🎁 GIFT ORDER — Include note in package</p>
        ${order.gift_sender_name?`<p style="margin:8px 0 0;font-size:13px"><b>From:</b> ${order.gift_sender_name}</p>`:''}
        ${order.gift_message?`<div style="margin-top:8px;padding:10px;background:#fff;border:1px solid #fecdd3;border-radius:4px"><p style="margin:0;font-size:10px;color:#666;text-transform:uppercase">Personal message</p><p style="margin:4px 0 0;font-style:italic">"${order.gift_message}"</p></div>`:''}
        <p style="margin:10px 0 0;font-size:11px;color:#666">⚠ Do not include receipt or pricing. Wrap as gift.</p>
      </div>`:''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px">
        <div><h2 style="font-size:11px;font-weight:bold;color:#666;text-transform:uppercase;margin:0 0 8px">Ship To</h2>
          <p style="margin:0;font-weight:600">${order.shipping_name}</p>
          <p style="margin:0;font-size:13px">${order.shipping_address}</p>
          <p style="margin:0;font-size:13px">${order.shipping_city}, ${order.shipping_state}</p>
          <p style="margin:8px 0 0;font-size:13px">📞 ${order.shipping_phone}</p>
          <p style="margin:0;font-size:13px">✉ ${order.shipping_email||''}</p>
        </div>
        ${order.notes?`<div><h2 style="font-size:11px;font-weight:bold;color:#666;text-transform:uppercase;margin:0 0 8px">Order Notes</h2><p style="margin:0;font-size:13px">${order.notes}</p></div>`:''}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="border-bottom:2px solid #000">
          <th style="text-align:left;padding:8px">Item</th><th style="text-align:left;padding:8px">Style</th>
          <th style="text-align:left;padding:8px">Color</th><th style="text-align:center;padding:8px">Qty</th>
          <th style="text-align:center;padding:8px">✓</th></tr></thead>
        <tbody>${order.order_items?.map((it:any)=>`<tr style="border-bottom:1px solid #ddd">
          <td style="padding:8px">${it.product_name}</td><td style="padding:8px">${it.variant_style}</td>
          <td style="padding:8px">${it.color}</td><td style="text-align:center;padding:8px;font-weight:bold">${it.quantity}</td>
          <td style="text-align:center;padding:8px">☐</td></tr>`).join('')||''}</tbody>
      </table>
      <div style="margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#666;display:flex;justify-content:space-between">
        <p>Picked by: ____________________</p><p>Packed by: ____________________</p><p>Date: ____________________</p>
      </div>
    </div>`;
  setTimeout(()=>{w.print();}, 300);
}

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
  is_test_order: boolean;
  is_gift?: boolean;
  gift_sender_name?: string | null;
  gift_message?: string | null;
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
    const updateData: { status: string; payment_status?: string } = { status };
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

  const toggleTestOrder = async (orderId: string, isTest: boolean) => {
    const { error } = await supabase.from('orders').update({ is_test_order: isTest }).eq('id', orderId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: isTest ? 'Marked as test order' : 'Unmarked test flag' });
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    // Delete items first, then order
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', orderId);
    if (itemsErr) {
      toast({ title: 'Error', description: itemsErr.message, variant: 'destructive' });
      setUpdatingOrderId(null); return;
    }
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Order deleted' }); fetchOrders(); }
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

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders"><Package className="mr-2 h-4 w-4" />Orders</TabsTrigger>
            <TabsTrigger value="products"><ShoppingBag className="mr-2 h-4 w-4" />Products</TabsTrigger>
            <TabsTrigger value="categories"><LayoutGrid className="mr-2 h-4 w-4" />Categories</TabsTrigger>
            <TabsTrigger value="coupons"><Tag className="mr-2 h-4 w-4" />Coupons</TabsTrigger>
            <TabsTrigger value="qa"><MessageCircle className="mr-2 h-4 w-4" />Q&A</TabsTrigger>
            <TabsTrigger value="newsletter"><Mail className="mr-2 h-4 w-4" />Newsletter</TabsTrigger>
            <TabsTrigger value="rewards"><Star className="mr-2 h-4 w-4" />Rewards</TabsTrigger>
            <TabsTrigger value="content"><FileText className="mr-2 h-4 w-4" />Site Content</TabsTrigger>
            <TabsTrigger value="admins"><UsersIcon className="mr-2 h-4 w-4" />Admins</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Orders</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
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
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                          {order.is_gift && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-gold/20 text-rose-gold px-1.5 py-0.5 text-[10px] font-semibold normal-case">
                              🎁 Gift
                            </span>
                          )}
                        </TableCell>
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
                                  {order.is_gift && (
                                    <div className="rounded-lg border-2 border-rose-gold/30 bg-rose-gold/5 p-3 text-sm">
                                      <p className="font-semibold flex items-center gap-1">🎁 Gift Order</p>
                                      {order.gift_sender_name && <p className="text-xs mt-1">From: <span className="font-medium">{order.gift_sender_name}</span></p>}
                                      {order.gift_message && <p className="text-xs italic mt-1">"{order.gift_message}"</p>}
                                    </div>
                                  )}
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
                                        {item.product_image && <img src={item.product_image} alt="" className="h-10 w-10 rounded object-cover" />}
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
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => printPackingSlip(order)}>
                                      <Printer className="h-4 w-4 mr-2" /> Print Packing Slip
                                    </Button>
                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                      <Button variant="gold" size="sm" className="flex-1" disabled={updatingOrderId === order.id} onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                        <Truck className="h-4 w-4 mr-2" /> Mark Delivered
                                      </Button>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                      {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                        <Button key={s} variant={order.status === s ? 'default' : 'outline'} size="sm" disabled={updatingOrderId === order.id} onClick={() => updateOrderStatus(order.id, s)}>
                                          {s}
                                        </Button>
                                      ))}
                                    </div>
                                    {order.payment_status === 'awaiting_confirmation' && (
                                      <div className="flex gap-2 mt-2">
                                        <Button variant="gold" size="sm" disabled={updatingOrderId === order.id} onClick={() => updateOrderStatus(order.id, 'confirmed', 'paid')}>
                                          <CheckCircle className="h-4 w-4 mr-1" /> Confirm Payment
                                        </Button>
                                        <Button variant="destructive" size="sm" disabled={updatingOrderId === order.id} onClick={() => updateOrderStatus(order.id, 'payment_failed', 'failed')}>
                                          <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  <Separator />
                                  <div className="space-y-3 rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Test / Building-Stage Order</p>
                                        <p className="text-xs text-muted-foreground">Mark to allow deletion of this order.</p>
                                      </div>
                                      <Switch
                                        checked={order.is_test_order}
                                        onCheckedChange={(c) => toggleTestOrder(order.id, c)}
                                      />
                                    </div>
                                    {order.is_test_order && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="sm" className="w-full" disabled={updatingOrderId === order.id}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete Order Permanently
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will permanently remove order {order.id.slice(0, 8).toUpperCase()} and all of its items. This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)} disabled={updatingOrderId === order.id}>
                              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
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
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminProductManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminCategoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminCouponManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle>Product Q&A</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminQAManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminNewsletterManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Rewards & Loyalty</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminRewardsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Site Content (Help / FAQ / Policies)</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminContentManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
