import { useMemo } from "react";
import { Building2, FileText, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhp } from "@/data/rental";
import {
  loadInvoices,
  loadReminders,
  loadRentalProperties,
  loadTenants,
} from "@/lib/rentalStorage";

const Dashboard = () => {
  const { profileName, user } = useAuth();
  const displayName = profileName || user?.email?.split("@")[0] || "Landlord";

  const properties = useMemo(() => loadRentalProperties(), []);
  const tenants = useMemo(() => loadTenants(), []);
  const reminders = useMemo(() => loadReminders(), []);
  const invoices = useMemo(() => loadInvoices(), []);

  const totalUnits = properties.reduce((sum, p) => sum + p.units.length, 0);
  const occupiedUnits = properties.reduce(
    (sum, p) => sum + p.units.filter((u) => u.status === "Occupied").length,
    0,
  );
  const overdueTenants = tenants.filter((t) => t.paymentStatus === "Overdue");
  const monthlyPotential = properties.reduce(
    (sum, p) => sum + p.units.reduce((inner, unit) => inner + unit.monthlyRent, 0),
    0,
  );
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground">
            Manage your properties, tenants, reminders, and invoices in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground">
                {occupiedUnits}/{totalUnits} units occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">{overdueTenants.length} overdue accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" /> Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reminders.length}</div>
              <p className="text-xs text-muted-foreground">Email follow-ups logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> Potential Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPhp(monthlyPotential)}</div>
              <p className="text-xs text-muted-foreground">Based on current rental setup</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              recentInvoices.map((invoice) => {
                const tenant = tenants.find((t) => t.id === invoice.tenantId);
                return (
                  <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{tenant?.fullName ?? "Unknown Tenant"}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.billingPeriod} - Due {invoice.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatPhp(invoice.amount)}</p>
                      <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

