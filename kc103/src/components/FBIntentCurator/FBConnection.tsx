import { useState } from "react";
import { Facebook, CheckCircle2, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FBConnectionProps {
  isConnected: boolean;
  onConnect: () => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

const FBConnection = ({ isConnected, onConnect, keywords, onKeywordsChange }: FBConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onConnect();
    setIsConnecting(false);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      onKeywordsChange([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const defaultKeywords = [
    "looking for",
    "buying",
    "house",
    "condo",
    "property",
    "real estate",
    "budget",
    "moving to",
    "invest",
    "pre-selling"
  ];

  const handleAddDefaultKeywords = () => {
    const combined = [...new Set([...keywords, ...defaultKeywords])];
    onKeywordsChange(combined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Connection</CardTitle>
        <CardDescription>
          Connect your Facebook account to monitor for high-intent buyers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Connect your Facebook account to start monitoring posts and comments for buying intent signals.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Connect Facebook
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              This is a mock connection. In production, this would authenticate with Facebook Graph API.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Facebook account connected successfully
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Connected Account</p>
                <p className="text-sm text-muted-foreground">facebook.com/your-page</p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Keyword Filters
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Keyword Filters</DialogTitle>
                  <DialogDescription>
                    Add keywords to filter posts and comments for buying intent
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Keyword</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                        placeholder="e.g., 'looking for house'"
                      />
                      <Button onClick={handleAddKeyword}>Add</Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Active Keywords ({keywords.length})</Label>
                    <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg">
                      {keywords.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No keywords added</p>
                      ) : (
                        keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          >
                            {keyword}
                            <span className="ml-2">×</span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddDefaultKeywords}
                    className="w-full"
                  >
                    Add Default Keywords
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FBConnection;

