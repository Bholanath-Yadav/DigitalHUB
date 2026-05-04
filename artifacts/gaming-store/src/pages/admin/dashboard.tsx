import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNPR } from "@/lib/currency";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, Package,
  Wallet, Tag, ArchiveX, CheckCircle2, Clock,
  XCircle, BadgeCheck, Layers,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  verified:  "#3b82f6",
  pending:   "#f59e0b",
  rejected:  "#ef4444",
};

const CATEGORY_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"];

const CATEGORY_LABELS: Record<string, string> = {
  "game-topups":   "Game Top-ups",
  "gift-cards":    "Gift Cards",
  "subscriptions": "Subscriptions",
  "vouchers":      "Vouchers",
};

function StatCard({
  title, value, sub, icon: Icon, gradient,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md">
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-20`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueCard({
  title, value, sub, icon: Icon, color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg" style={{ background: color + "20" }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-violet-400">Revenue: {fmtNPR(payload[0]?.value ?? 0)}</p>
      <p className="text-cyan-400">Orders: {payload[1]?.value ?? 0}</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium capitalize">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value} orders</p>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{CATEGORY_LABELS[label] ?? label}</p>
      <p className="text-violet-400">Products: {payload[0]?.value}</p>
      <p className="text-cyan-400">Value: {fmtNPR(payload[1]?.value ?? 0)}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard({
    query: { queryKey: ["admin-dashboard"] },
  });

  if (isLoading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const pieData = Object.entries(stats.ordersByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] }));

  const chartData = stats.revenueByDay.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const catData = stats.productsByCategory.map(c => ({
    ...c,
    label: CATEGORY_LABELS[c.category] ?? c.category,
  }));

  const completionRate = stats.totalOrders > 0
    ? Math.round(((stats.ordersByStatus.completed + stats.ordersByStatus.verified) / stats.totalOrders) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1.5">
          <TrendingUp className="h-3 w-3" /> Last 30 days
        </Badge>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={fmtNPR(stats.totalRevenue)}
          sub={`${completionRate}% completion rate`}
          icon={Wallet}
          gradient="bg-gradient-to-br from-violet-500 to-purple-700"
        />
        <StatCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          sub={`${stats.ordersByStatus.pending} awaiting review`}
          icon={ShoppingCart}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        />
        <StatCard
          title="Registered Users"
          value={String(stats.totalUsers)}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Total Products"
          value={String(stats.totalProducts)}
          icon={Package}
          gradient="bg-gradient-to-br from-orange-500 to-rose-600"
        />
      </div>

      {/* Product Value Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Product Value Breakdown
        </h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <ValueCard
            title="Total Catalog Value"
            value={fmtNPR(stats.totalCatalogValue)}
            sub="Sum of all product base prices"
            icon={Tag}
            color="#8b5cf6"
          />
          <ValueCard
            title="Sold Value (Revenue)"
            value={fmtNPR(stats.soldValue)}
            sub="Revenue from verified & completed orders"
            icon={BadgeCheck}
            color="#22c55e"
          />
          <ValueCard
            title="In-Stock Value"
            value={fmtNPR(stats.inStockValue)}
            sub="Total value of products currently in stock"
            icon={ArchiveX}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Revenue Area Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Revenue & Orders — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false}
                interval={4}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                width={45}
              />
              <YAxis yAxisId="orders" orientation="right" hide />
              <Tooltip content={<CustomAreaTooltip />} />
              <Area
                yAxisId="revenue" type="monotone" dataKey="revenue"
                stroke="#8b5cf6" strokeWidth={2}
                fill="url(#gradRevenue)"
              />
              <Area
                yAxisId="orders" type="monotone" dataKey="orders"
                stroke="#06b6d4" strokeWidth={2}
                fill="url(#gradOrders)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500 inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" /> Orders
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Orders by Status + Products by Category */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Donut — Orders by Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalOrders === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No orders yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={58} outerRadius={82}
                      paddingAngle={3} dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(["pending","verified","completed","rejected"] as const).map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s] }} />
                      <span className="text-muted-foreground capitalize">{s}</span>
                      <span className="ml-auto font-semibold">{stats.ordersByStatus[s]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bar — Products by Category */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No products yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category" dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false} tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => {
                    const StatusIcon = {
                      completed: CheckCircle2,
                      verified:  BadgeCheck,
                      pending:   Clock,
                      rejected:  XCircle,
                    }[order.status] ?? Clock;

                    return (
                      <tr key={order.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i === stats.recentOrders.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-5 py-3.5 font-mono text-muted-foreground text-xs">#{order.id}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium">{order.guestName ?? "Member"}</span>
                          {order.guestEmail && <p className="text-xs text-muted-foreground">{order.guestEmail}</p>}
                        </td>
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <span className="truncate block">{(order as any).product?.name ?? `Product #${order.productId}`}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold">{fmtNPR(order.totalAmount)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                            style={{
                              background: STATUS_COLORS[order.status] + "20",
                              color: STATUS_COLORS[order.status],
                            }}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
