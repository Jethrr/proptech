import { useState } from "react";
import { Facebook, Star, Save, CheckCircle2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity, IntentLevel } from "@/data/leads";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSave: (opportunity: Opportunity) => void;
  isSaved?: boolean;
}

const OpportunityCard = ({ opportunity, onSave, isSaved = false }: OpportunityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const intentColors: Record<IntentLevel, string> = {
    High: "bg-green-500 text-white",
    Medium: "bg-yellow-500 text-white",
    Low: "bg-gray-500 text-white",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const highlightKeywords = (text: string, keywords?: string[]) => {
    if (!keywords || keywords.length === 0) return text;

    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">$1</mark>'
      );
    });

    return highlighted;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">{opportunity.author}</p>
                {opportunity.authorProfile && (
                  <a
                    href={opportunity.authorProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(opportunity.timestamp)} • {opportunity.platform}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={intentColors[opportunity.intentLevel]}>
              <Star className="h-3 w-3 mr-1" />
              {opportunity.intentLevel} Intent
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightKeywords(opportunity.postContent, opportunity.keywords)
            }}
          />

          {opportunity.keywords && opportunity.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {opportunity.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.keywords.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant={isSaved ? "outline" : "default"}
            size="sm"
            onClick={() => onSave(opportunity)}
            disabled={isSaved}
            className="flex-1"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved to Hot Leads
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Hot Leads
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-2 border-t space-y-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Platform:</span> {opportunity.platform}
            </div>
            <div>
              <span className="font-medium">Posted:</span> {new Date(opportunity.timestamp).toLocaleString()}
            </div>
            {opportunity.linkedLeadId && (
              <div>
                <span className="font-medium">Linked Lead:</span> {opportunity.linkedLeadId}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;

