import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Facebook, 
  Calculator,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { loadLeadsFromStorage, loadOpportunitiesFromStorage } from "@/lib/mockData";
import { mockLeads } from "@/data/leads";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalLeads, setTotalLeads] = useState(0);
  const [hotLeads, setHotLeads] = useState(0);
  const [opportunities, setOpportunities] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Helper function to normalize dates (remove time component)
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Mock events/appointments for the calendar
  const today = normalizeDate(new Date());
  const events = [
    { date: today, title: "Follow up with John Doe", time: "10:00 AM", type: "call" },
    { date: normalizeDate(new Date(today.getTime() + 86400000)), title: "Property viewing - 123 Main St", time: "2:00 PM", type: "meeting" },
    { date: normalizeDate(new Date(today.getTime() + 2 * 86400000)), title: "Contract review", time: "11:00 AM", type: "meeting" },
    { date: normalizeDate(new Date(today.getTime() + 5 * 86400000)), title: "Client consultation", time: "3:30 PM", type: "call" },
  ];

  // Get dates with events for calendar modifiers
  const eventDates = events.map(e => e.date);

  useEffect(() => {
    // Load leads from storage or use mock data
    const storedLeads = loadLeadsFromStorage();
    const leads = storedLeads.length > 0 ? storedLeads : mockLeads;
    
    setTotalLeads(leads.length);
    setHotLeads(leads.filter(l => l.status === "Hot").length);

    // Load opportunities
    const storedOpps = loadOpportunitiesFromStorage();
    setOpportunities(storedOpps.length);
  }, []);

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? events.filter(event => {
        const eventDate = normalizeDate(event.date);
        const selected = normalizeDate(selectedDate);
        return eventDate.getTime() === selected.getTime();
      })
    : [];

  // Get upcoming events (next 7 days)
  const now = normalizeDate(new Date());
  const upcomingEvents = events
    .filter(event => {
      const eventDate = normalizeDate(event.date);
      return eventDate.getTime() >= now.getTime();
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);


  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, Agent
          </h2>
          <p className="text-muted-foreground">
            Recover revenue from dormant leads and discover high-intent buyers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all sources
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{hotLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                High priority prospects
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Facebook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{opportunities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From social media
              </p>
            </CardContent>
          </Card>
        </div>

       

        {/* Interactive Calendar */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle>Calendar</CardTitle>
              </div>
              <CardDescription>View and manage your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasEvent: eventDates
                }}
                modifiersClassNames={{
                  hasEvent: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full"
                }}
              />
              {selectedDate && selectedDateEvents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold mb-3">
                    Events on {format(selectedDate, "MMMM d, yyyy")}
                  </h4>
                  <div className="space-y-2">
                    {selectedDateEvents.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 5 scheduled items</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(event.date)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {format(event.date, "MMM d")}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          event.type === "call" ? "bg-blue-500" : "bg-green-500"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

