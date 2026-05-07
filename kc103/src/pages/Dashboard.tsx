import { useEffect, useMemo, useState } from "react";
import { Building2, Clock3, FileText, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice, Reminder, RentalProperty, Tenant, formatPhp } from "@/data/rental";
import { loadInvoices, loadReminders } from "@/lib/rentalStorage";
import { api } from "@/lib/api";

const Dashboard = () => {
  const { firstName, profileName, user } = useAuth();
  const displayName = useMemo(() => {
    if (firstName) return firstName;
    if (profileName) return profileName.split(" ")[0]?.trim() || "Landlord";
    return user?.email?.split("@")[0] || "Landlord";
  }, [firstName, profileName, user?.email]);

  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const reminders = useMemo(() => loadReminders(), []);
  const invoices = useMemo(() => loadInvoices(), []);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [propsRes, tenantsRes] = await Promise.all([api.getProperties(), api.getTenants()]);
        setProperties(propsRes.properties as RentalProperty[]);
        setTenants(tenantsRes.tenants as Tenant[]);
      } catch {
        /* keep empty when offline / unauthenticated */
      }
    };
    void load();
  }, []);

  const totalUnits = properties.reduce((sum, p) => sum + p.units.length, 0);
  const occupiedUnits = properties.reduce(
    (sum, p) => sum + p.units.filter((u) => u.status === "Occupied").length,
    0,
  );
  const overdueTenants = tenants.filter((t) => t.paymentStatus === "Overdue");
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based

  const monthlyRevenue = invoices.reduce((sum, invoice) => {
    if (invoice.status !== "Paid") return sum;
    const dateStr = invoice.dueDate || invoice.createdAt;
    if (!dateStr) return sum;
    const [y, m] = dateStr.slice(0, 10).split("-").map((v) => Number(v));
    if (y === currentYear && m === currentMonth + 1) {
      return sum + invoice.amount;
    }
    return sum;
  }, 0);
  const paidInvoicesThisMonthCount = invoices.filter((invoice) => {
    if (invoice.status !== "Paid") return false;
    const dateStr = invoice.dueDate || invoice.createdAt;
    if (!dateStr) return false;
    const [y, m] = dateStr.slice(0, 10).split("-").map((v) => Number(v));
    return y === currentYear && m === currentMonth + 1;
  }).length;

  const getInvoiceStatusBadgeClass = (status: Invoice["status"]) => {
    if (status === "Paid") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (status === "Sent") return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };
  const recentInvoices = [...invoices].reverse().slice(0, 5);
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  type EventType = "rent-due" | "reminder" | "invoice-due";
  type CalendarEvent =
    | {
        id: string;
        type: "rent-due";
        label: string;
        tenantId: string;
        tenantName: string;
        dueDay: number;
        paymentStatus: Tenant["paymentStatus"];
      }
    | {
        id: string;
        type: "reminder";
        label: string;
        reminderId: string;
        subject: string;
        scheduledAt: string;
        status: Reminder["status"];
        message: string;
      }
    | {
        id: string;
        type: "invoice-due";
        label: string;
        invoiceId: string;
        billingPeriod: string;
        dueDate: string;
        amount: number;
        invoiceStatus: Invoice["status"];
        tenantName: string;
      };

  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    const addEvent = (dateStr: string, ev: CalendarEvent) => {
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(ev);
    };

    const pad = (n: number) => String(n).padStart(2, "0");
    const monthStr = pad(currentMonth + 1);

    tenants.forEach((tenant) => {
      const day = Math.min(Math.max(tenant.dueDate, 1), daysInMonth);
      const dateStr = `${currentYear}-${monthStr}-${pad(day)}`;
      addEvent(dateStr, {
        id: `rent-${tenant.id}`,
        label: `Rent due – ${tenant.fullName}`,
        type: "rent-due",
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        dueDay: tenant.dueDate,
        paymentStatus: tenant.paymentStatus,
      });
    });

    reminders.forEach((reminder) => {
      const when = reminder.scheduledAt?.slice(0, 10);
      if (!when) return;
      const [y, m] = when.split("-").map((v) => Number(v));
      if (y === currentYear && m === currentMonth + 1) {
        addEvent(when, {
          id: `reminder-${reminder.id}`,
          label: `Reminder – ${reminder.subject}`,
          type: "reminder",
          reminderId: reminder.id,
          subject: reminder.subject,
          scheduledAt: reminder.scheduledAt,
          status: reminder.status,
          message: reminder.message,
        });
      }
    });

    invoices.forEach((invoice) => {
      const when = invoice.dueDate?.slice(0, 10);
      if (!when) return;
      const [y, m] = when.split("-").map((v) => Number(v));
      if (y === currentYear && m === currentMonth + 1) {
        const tenant = tenants.find((t) => t.id === invoice.tenantId);
        addEvent(when, {
          id: `invoice-${invoice.id}`,
          label: `Invoice due – ${tenant?.fullName ?? "Tenant"}`,
          type: "invoice-due",
          invoiceId: invoice.id,
          tenantName: tenant?.fullName ?? "Tenant",
          billingPeriod: invoice.billingPeriod,
          dueDate: invoice.dueDate,
          amount: invoice.amount,
          invoiceStatus: invoice.status,
        });
      }
    });

    return map;
  }, [currentMonth, currentYear, invoices, reminders, tenants]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(firstOfMonth);

  const selectedEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return calendarEventsByDate.get(selectedDateStr) ?? [];
  }, [calendarEventsByDate, selectedDateStr]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateStr) return "";
    const d = new Date(`${selectedDateStr}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  }, [selectedDateStr]);

  const openDayDetails = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsDateDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}</h1>
              <p className="text-sm text-white/80 mt-1">
                Manage your properties, tenants, reminders, and invoices in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-rose-500/15 text-rose-100 border border-rose-500/25 hover:bg-rose-500/20"
              >
                {overdueTenants.length} overdue
              </Badge>
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-100 border border-amber-500/25 hover:bg-amber-500/20"
              >
                {formatPhp(monthlyRevenue)} revenue
              </Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-emerald-200/20 bg-emerald-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-100 border border-emerald-200/20">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">Properties</p>
                  <p className="mt-1 text-2xl font-bold leading-none">{properties.length}</p>
                  <p className="mt-2 text-xs text-white/70">
                    {occupiedUnits}/{totalUnits} units occupied
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-sky-200/20 bg-sky-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-sky-500/15 p-2 text-sky-100 border border-sky-200/20">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">Tenants</p>
                  <p className="mt-1 text-2xl font-bold leading-none">{tenants.length}</p>
                  <p className="mt-2 text-xs text-white/70">{overdueTenants.length} overdue accounts</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/20 bg-amber-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-amber-500/15 p-2 text-amber-100 border border-amber-200/20">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">Reminders</p>
                  <p className="mt-1 text-2xl font-bold leading-none">{reminders.length}</p>
                  <p className="mt-2 text-xs text-white/70">Email follow-ups logged</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200/20 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-100 border border-emerald-200/20">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">Revenue</p>
                  <p className="mt-1 text-2xl font-bold leading-none">{formatPhp(monthlyRevenue)}</p>
                  <p className="mt-2 text-xs text-white/70">
                    {paidInvoicesThisMonthCount} paid invoice{paidInvoicesThisMonthCount === 1 ? "" : "s"} this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-start">
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Calendar</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthLabel} – rent due dates, reminders, and invoice due dates.
                  </p>
                </div>
                <div className="hidden sm:block rounded-lg border bg-background px-2.5 py-1">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground mb-3">
                <span className="text-center">Sun</span>
                <span className="text-center">Mon</span>
                <span className="text-center">Tue</span>
                <span className="text-center">Wed</span>
                <span className="text-center">Thu</span>
                <span className="text-center">Fri</span>
                <span className="text-center">Sat</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs">
                {Array.from({ length: startWeekday }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-20 rounded-lg border bg-muted/30" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const pad = (n: number) => String(n).padStart(2, "0");
                  const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
                  const events = calendarEventsByDate.get(dateStr) ?? [];
                  const isToday = day === today.getDate();
                  return (
                    <div
                      key={dateStr}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${dateStr}`}
                      className={`h-20 rounded-lg border p-2 flex flex-col gap-1 overflow-hidden ${
                        isToday ? "border-slate-900 bg-slate-900/5" : "bg-muted/30"
                      }`}
                      onClick={() => openDayDetails(dateStr)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDayDetails(dateStr);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-medium ${
                            isToday ? "text-slate-900" : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        {events.length > 0 ? (
                          <span className="text-[10px] rounded-full bg-slate-900 text-white px-1.5 py-0.5">
                            {events.length}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {events.slice(0, 3).map((event, idx2) => {
                          const base =
                            event.type === "rent-due"
                              ? "bg-amber-100 text-amber-800"
                              : event.type === "reminder"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-emerald-100 text-emerald-800";
                          return (
                            <div
                              key={`${dateStr}-${idx2}`}
                              className={`truncate rounded px-1.5 py-0.5 text-[10px] ${base}`}
                            >
                              {event.label}
                            </div>
                          );
                        })}
                        {events.length > 3 ? (
                          <div className="text-[10px] text-muted-foreground">+{events.length - 3} more</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle className="text-base">Recent invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              ) : (
                recentInvoices.map((invoice) => {
                  const tenant = tenants.find((t) => t.id === invoice.tenantId);
                  const statusRowClass =
                    invoice.status === "Paid"
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : invoice.status === "Sent"
                        ? "bg-sky-500/5 border-sky-500/30"
                        : "bg-amber-500/5 border-amber-500/30";
                  return (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between rounded-xl border p-4 transition hover:shadow-sm ${statusRowClass}`}
                    >
                      <div>
                        <p className="font-medium leading-tight">{tenant?.fullName ?? "Unknown Tenant"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {invoice.billingPeriod} - Due {invoice.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{formatPhp(invoice.amount)}</p>
                        <Badge className={getInvoiceStatusBadgeClass(invoice.status)} variant="outline">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Details for {selectedDateLabel || "Date"}</DialogTitle>
          </DialogHeader>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events on this date.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {selectedEvents
                .slice()
                .sort((a, b) => {
                  const order = (ev: CalendarEvent["type"]) =>
                    ev === "rent-due" ? 0 : ev === "reminder" ? 1 : 2;
                  return order(a.type) - order(b.type);
                })
                .map((ev) => {
                  const chipClasses =
                    ev.type === "rent-due"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : ev.type === "reminder"
                        ? "bg-sky-100 text-sky-800 border border-sky-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200";

                  return (
                    <div key={ev.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{ev.label}</p>
                          {ev.type === "rent-due" ? (
                            <p className="text-xs text-muted-foreground">
                              Due day: {ev.dueDay} • Payment status: {ev.paymentStatus}
                            </p>
                          ) : ev.type === "reminder" ? (
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {ev.scheduledAt.slice(0, 10)} • Status: {ev.status}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {ev.billingPeriod} • Due: {ev.dueDate}
                            </p>
                          )}
                        </div>

                        <Badge className={chipClasses} variant="outline">
                          {ev.type === "rent-due" ? "Rent Due" : ev.type === "reminder" ? "Reminder" : "Invoice"}
                        </Badge>
                      </div>

                      {ev.type === "reminder" ? (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{ev.message}</p>
                      ) : null}

                      {ev.type === "invoice-due" ? (
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">{formatPhp(ev.amount)}</p>
                            <Badge variant={ev.invoiceStatus === "Paid" ? "default" : "secondary"}>
                              {ev.invoiceStatus}
                            </Badge>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

