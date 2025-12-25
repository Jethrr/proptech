import { useState, useEffect } from "react";
import { Sparkles, Mail, MessageSquare, Send, Loader2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/data/leads";
import { generateAIMessage } from "@/lib/mockData";

interface MessageGeneratorProps {
  selectedLeads: Lead[];
  onMessagesSent: () => void;
}

interface GeneratedMessage {
  leadId: string;
  leadName: string;
  type: "SMS" | "Email";
  content: string;
  edited: boolean;
}

const MessageGenerator = ({ selectedLeads, onMessagesSent }: MessageGeneratorProps) => {
  const [messageType, setMessageType] = useState<"SMS" | "Email">("SMS");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedLeads.length === 0) {
      setGeneratedMessages([]);
    }
  }, [selectedLeads]);

  const handleGenerate = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to generate messages for.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const messages: GeneratedMessage[] = selectedLeads.map(lead => ({
      leadId: lead.id,
      leadName: lead.name,
      type: messageType,
      content: generateAIMessage(lead, messageType),
      edited: false,
    }));

    setGeneratedMessages(messages);
    setIsGenerating(false);

    toast({
      title: "Messages generated",
      description: `Generated ${messages.length} ${messageType} message${messages.length > 1 ? "s" : ""} using AI.`,
    });
  };

  const handleEdit = (leadId: string, newContent: string) => {
    setGeneratedMessages(prev =>
      prev.map(msg =>
        msg.leadId === leadId
          ? { ...msg, content: newContent, edited: true }
          : msg
      )
    );
  };

  const handleSend = async (leadId: string) => {
    const message = generatedMessages.find(m => m.leadId === leadId);
    if (!message) return;

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent",
      description: `${message.type} sent to ${message.leadName}`,
    });

    // Remove sent message
    setGeneratedMessages(prev => prev.filter(m => m.leadId !== leadId));

    // If all messages sent, trigger callback
    const remaining = generatedMessages.filter(m => m.leadId !== leadId);
    if (remaining.length === 0) {
      onMessagesSent();
    }
  };

  const handleSendAll = async () => {
    if (generatedMessages.length === 0) return;

    setIsGenerating(true);
    
    // Simulate sending all
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "All messages sent",
      description: `Sent ${generatedMessages.length} ${messageType} message${generatedMessages.length > 1 ? "s" : ""}.`,
    });

    setGeneratedMessages([]);
    setIsGenerating(false);
    onMessagesSent();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Message Generator</CardTitle>
        <CardDescription>
          Generate personalized re-engagement messages for selected leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label>Message Type</Label>
            <Select value={messageType} onValueChange={(v) => setMessageType(v as "SMS" | "Email")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMS">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="Email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={selectedLeads.length === 0 || isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Messages
                </>
              )}
            </Button>
          </div>
        </div>

        {selectedLeads.length > 0 && (
          <Alert>
            <AlertDescription>
              {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""} selected for message generation
            </AlertDescription>
          </Alert>
        )}

        {/* Generated Messages */}
        {generatedMessages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {generatedMessages.length} message{generatedMessages.length > 1 ? "s" : ""} ready
              </p>
              <Button
                onClick={handleSendAll}
                disabled={isGenerating}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Send All
              </Button>
            </div>

            {generatedMessages.map((message) => (
              <Card key={message.leadId} className="bg-secondary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{message.leadName}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                      {message.edited && (
                        <Badge variant="secondary" className="text-xs">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edited
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSend(message.leadId)}
                      size="sm"
                      disabled={isGenerating}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === message.leadId ? (
                    <div className="space-y-2">
                      <Textarea
                        value={message.content}
                        onChange={(e) => handleEdit(message.leadId, e.target.value)}
                        rows={message.type === "SMS" ? 4 : 8}
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingId(null)}
                          size="sm"
                          variant="outline"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Done Editing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-background rounded-lg p-4 border text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <Button
                        onClick={() => setEditingId(message.leadId)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Message
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedLeads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select leads from the list above to generate messages</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageGenerator;

