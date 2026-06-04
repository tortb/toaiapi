'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Search, RefreshCw, Receipt } from 'lucide-react';

interface Order {
  id: string;
  order_no: string;
  user_id: string;
  amount: number;
  paid_amount: number | null;
  payment_method: string | null;
  status: string;
  product_type: string;
  product_name: string;
  paid_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  FAILED: '支付失败',
  REFUNDED: '已退款',
  CANCELLED: '已取消',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EPAY_ALIPAY: '易支付-支付宝',
  EPAY_WECHAT: '易支付-微信',
  EPAY_QQ: '易支付-QQ',
  ALIPAY: '支付宝',
  WECHAT_PAY: '微信支付',
};

/**
 * 订单管理页面
 *
 * 显示所有订单列表，支持筛选和查看详情。
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // 筛选条件
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // 注意：这里需要后端提供订单列表API
      // 暂时使用模拟数据
      const mockOrders: Order[] = [
        {
          id: '1',
          order_no: 'TOAI1ABC123',
          user_id: 'user1',
          amount: 1000,
          paid_amount: 1000,
          payment_method: 'EPAY_ALIPAY',
          status: 'PAID',
          product_type: 'recharge',
          product_name: 'ToAIAPI 余额充值',
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ];

      setOrders(mockOrders);
      setTotal(mockOrders.length);
    } catch (error) {
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery && !order.order_no.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">订单管理</h1>
          <p className="text-sm text-muted-foreground">查看和管理所有支付订单</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>订单列表</CardTitle>
              <CardDescription>共 {total} 个订单</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="PENDING">待支付</SelectItem>
                  <SelectItem value="PAID">已支付</SelectItem>
                  <SelectItem value="FAILED">支付失败</SelectItem>
                  <SelectItem value="REFUNDED">已退款</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>支付时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-[200px] text-center text-muted-foreground">
                        暂无订单数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.order_no}
                        </TableCell>
                        <TableCell>{order.product_name}</TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(order.amount)}
                        </TableCell>
                        <TableCell>
                          {order.payment_method
                            ? PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[order.status] || ''}>
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.paid_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* 分页 */}
              {total > pageSize && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
