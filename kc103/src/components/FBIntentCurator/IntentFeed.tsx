import { useState, useMemo } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Opportunity, IntentLevel } from "@/data/leads";
import OpportunityCard from "./OpportunityCard";

interface IntentFeedProps {
  opportunities: Opportunity[];
  keywords: string[];
  onSaveOpportunity: (opportunity: Opportunity) => void;
  savedOpportunityIds: string[];
}

const IntentFeed = ({
  opportunities,
  keywords,
  onSaveOpportunity,
  savedOpportunityIds,
}: IntentFeedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<IntentLevel | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Filter by intent level
    if (intentFilter !== "all") {
      filtered = filtered.filter(opp => opp.intentLevel === intentFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        opp =>
          opp.postContent.toLowerCase().includes(query) ||
          opp.author.toLowerCase().includes(query)
      );
    }

    // Filter by keywords if provided
    if (keywords.length > 0) {
      filtered = filtered.filter(opp =>
        keywords.some(keyword =>
          opp.postContent.toLowerCase().includes(keyword.toLowerCase()) ||
          opp.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
        )
      );
    }

    return filtered;
  }, [opportunities, searchQuery, intentFilter, keywords]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const intentCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    opportunities.forEach(opp => {
      counts[opp.intentLevel]++;
    });
    return counts;
  }, [opportunities]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Intent Feed</CardTitle>
            <CardDescription>
              {filteredOpportunities.length} of {opportunities.length} opportunities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={intentFilter} onValueChange={(v) => setIntentFilter(v as IntentLevel | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Intent Levels</SelectItem>
              <SelectItem value="High">
                High ({intentCounts.High})
              </SelectItem>
              <SelectItem value="Medium">
                Medium ({intentCounts.Medium})
              </SelectItem>
              <SelectItem value="Low">
                Low ({intentCounts.Low})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intent Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
            High: {intentCounts.High}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            Medium: {intentCounts.Medium}
          </Badge>
          <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
            Low: {intentCounts.Low}
          </Badge>
        </div>

        {/* Opportunities List */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No opportunities found</p>
            <p className="text-sm mt-2">
              {keywords.length > 0
                ? "Try adjusting your keyword filters"
                : "Connect Facebook and add keyword filters to start finding opportunities"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSave={onSaveOpportunity}
                isSaved={savedOpportunityIds.includes(opportunity.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntentFeed;

