import { useGetOrder } from "@/lib/api-hooks";
import { useRoute, Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, ChevronRight } from "lucide-react";
import SafeImage from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { fmtNPR } from "@/lib/currency";

export default function OrderStatus() {
  const [, params] = useRoute("/orders/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");

  const { data: order, isLoading } = useGetOrder(id, {
    query: {
      queryKey: ["order", id],
      enabled: !!id,
      refetchInterval: 10000 // Poll every 10s
    }
  });

  if (isLoading) return <div className="container py-20 text-center">Loading order...</div>;
  if (!order) return <div className="container py-20 text-center">Order not found</div>;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", text: "Pending Verification" };
      case "verified": return { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10", text: "Payment Verified, Processing" };
      case "completed": return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", text: "Order Completed" };
      case "rejected": return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", text: "Order Rejected" };
      default: return { icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-500/10", text: "Unknown Status" };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container py-8 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/profile" className="hover:text-foreground">Orders</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Order #{order.id}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-2" style={{ borderColor: `var(--${statusConfig.color.replace('text-', '')})` }}>
            <div className={`p-8 flex flex-col items-center justify-center text-center ${statusConfig.bg}`}>
              <StatusIcon className={`h-16 w-16 mb-4 ${statusConfig.color}`} />
              <h2 className="text-2xl font-bold mb-2">{statusConfig.text}</h2>
              <p className="text-muted-foreground max-w-md">
                {order.status === "pending" && "We have received your order and payment screenshot. Our team is verifying it now."}
                {order.status === "verified" && "Your payment has been verified. We are processing your digital delivery."}
                {order.status === "completed" && "Your order has been completed! The top-up/gift card has been delivered."}
                {order.status === "rejected" && "Your order was rejected. Please contact support for more information."}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                {order.product.imageUrl ? (
                  <SafeImage src={order.product.imageUrl} className="h-20 w-20 rounded-md object-cover border border-border" alt="" />
                ) : (
                  <div className="h-20 w-20 rounded-md bg-muted border border-border"></div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{order.product.name}</h3>
                  <p className="text-muted-foreground">{order.product.category}</p>
                  <p className="font-bold text-primary mt-1">{fmtNPR(order.totalAmount - order.discountAmount)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Delivery Details</h4>
                <div className="bg-muted rounded-md p-4 space-y-2">
                  {Object.entries(order.gameDetails || {})
                    .map(([k, v]): [string, string] => {
                      if (k === "__variantName") return ["Package", v as string];
                      return [k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim(), v as string];
                    })
                    .map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{label}</span>
                        <span className="font-mono font-medium">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span>{order.guestEmail || "Account user"}</span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{fmtNPR(order.totalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-{fmtNPR(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total Paid</span>
                  <span>{fmtNPR(order.totalAmount - order.discountAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.status === "pending" && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Haven't submitted payment proof yet?</p>
                <Button variant="outline" className="w-full" onClick={() => setLocation(`/checkout/${order.id}`)}>
                  Complete Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {order.paymentScreenshotUrl && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={order.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" /> View Screenshot
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
