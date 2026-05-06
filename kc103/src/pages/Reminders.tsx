import { useEffect, useMemo, useState } from "react";
import { MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { loadReminders, loadTenants, saveReminders } from "@/lib/rentalStorage";
import { Reminder } from "@/data/rental";
import { useToast } from "@/hooks/use-toast";

const Reminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tenants = useMemo(() => loadTenants(), []);
  const [formData, setFormData] = useState({
    tenantId: "",
    subject: "Rent due date reminder",
    message:
      "Hello, this is a friendly reminder that your rental payment is due soon. Please settle on or before your due date. Thank you.",
    scheduledAt: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    setReminders(loadReminders());
  }, []);

  const sendReminder = () => {
    const now = new Date().toISOString();
    const next: Reminder = {
      id: `rem-${Date.now()}`,
      tenantId: formData.tenantId,
      subject: formData.subject,
      message: formData.message,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      sentAt: now,
      status: "Sent",
    };
    const updated = [next, ...reminders];
    setReminders(updated);
    saveReminders(updated);
    setIsDialogOpen(false);
    toast({ title: "Reminder sent", description: "Email follow-up logged using mock send flow." });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Follow-Up Reminders</h1>
            <p className="text-muted-foreground">Send due-date reminders or custom payment follow-ups.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit">
            <MailPlus className="h-4 w-4" /> New Reminder
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reminder History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reminders sent yet.</p>
            ) : (
              reminders.map((reminder) => {
                const tenant = tenants.find((t) => t.id === reminder.tenantId);
                return (
                  <div key={reminder.id} className="rounded-lg border p-3">
                    <p className="font-medium">{reminder.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {tenant?.fullName ?? "Unknown tenant"} ({tenant?.email ?? "N/A"})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scheduled: {new Date(reminder.scheduledAt).toLocaleString()} | Status: {reminder.status}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, tenantId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Schedule Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendReminder} disabled={!formData.tenantId || !formData.subject || !formData.message}>
                  Send Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Reminders;
