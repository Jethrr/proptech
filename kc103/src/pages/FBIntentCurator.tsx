import { useState, useEffect } from "react";
import { Facebook, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FBConnection from "@/components/FBIntentCurator/FBConnection";
import IntentFeed from "@/components/FBIntentCurator/IntentFeed";
import OpportunityCard from "@/components/FBIntentCurator/OpportunityCard";
import { Opportunity } from "@/data/leads";
import { mockOpportunities } from "@/data/leads";
import {
  loadOpportunitiesFromStorage,
  saveOpportunitiesToStorage,
} from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const FBIntentCurator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    // Load saved opportunities from storage
    const stored = loadOpportunitiesFromStorage(user?.id);
    if (stored.length > 0) {
      setSavedOpportunities(stored);
    }

    // Load mock opportunities
    setOpportunities(mockOpportunities);
  }, []);

  const handleConnect = () => {
    setIsConnected(true);
    toast({
      title: "Facebook connected",
      description: "You can now monitor for high-intent buyers.",
    });
  };

  const handleSaveOpportunity = (opportunity: Opportunity) => {
    // Check if already saved
    if (savedOpportunities.some((opp) => opp.id === opportunity.id)) {
      return;
    }

    const updated = [...savedOpportunities, opportunity];
    setSavedOpportunities(updated);
    saveOpportunitiesToStorage(updated, user?.id);

    toast({
      title: "Opportunity saved",
      description: `"${opportunity.author}" added to Hot Leads`,
    });

    // Switch to saved tab
    setActiveTab("saved");
  };

  const handleRemoveSaved = (opportunityId: string) => {
    const updated = savedOpportunities.filter(
      (opp) => opp.id !== opportunityId,
    );
    setSavedOpportunities(updated);
    saveOpportunitiesToStorage(updated, user?.id);

    toast({
      title: "Opportunity removed",
      description: "Removed from saved opportunities",
    });
  };

  const savedOpportunityIds = new Set(savedOpportunities.map((opp) => opp.id));

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Discover High-Intent Buyers
          </h2>
          <p className="text-muted-foreground">
            Monitor Facebook for buying signals and save opportunities to Hot
            Leads
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Connection Card */}
          <div className="lg:col-span-1">
            <FBConnection
              isConnected={isConnected}
              onConnect={handleConnect}
              keywords={keywords}
              onKeywordsChange={setKeywords}
            />
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{opportunities.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Found in feed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Saved to Hot Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {savedOpportunities.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to contact
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="feed">Intent Feed</TabsTrigger>
            <TabsTrigger value="saved">
              Saved Opportunities ({savedOpportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Facebook className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">
                    Connect Facebook to start monitoring for opportunities
                  </p>
                  <Button onClick={handleConnect} className="mt-4">
                    Connect Facebook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <IntentFeed
                opportunities={opportunities}
                keywords={keywords}
                onSaveOpportunity={handleSaveOpportunity}
                savedOpportunityIds={Array.from(savedOpportunityIds)}
              />
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedOpportunities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No saved opportunities yet. Start saving from the Intent
                    Feed!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="relative">
                    <OpportunityCard
                      opportunity={opportunity}
                      onSave={handleSaveOpportunity}
                      isSaved={true}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSaved(opportunity.id)}
                      className="absolute top-4 right-4"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FBIntentCurator;
