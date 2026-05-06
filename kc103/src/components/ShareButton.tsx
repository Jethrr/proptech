import { useState } from "react";
import { Share2, Link, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Property, formatCurrency, calculateMonthlyPayment, calculateRequiredIncome } from "@/data/properties";

interface ShareButtonProps {
  property: Property;
}

const ShareButton = ({ property }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [messengerCopied, setMessengerCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Generate a unique share link
  const shareLink = `${window.location.origin}/share/${property.id}`;

  // Calculate default values for the summary
  const downpayment = property.price * 0.2;
  const loanAmount = property.price - downpayment;
  const monthlyAmortization = calculateMonthlyPayment(loanAmount, 7, 20 * 12);
  const requiredIncome = calculateRequiredIncome(monthlyAmortization);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your client to capture their details.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleCopyMessenger = async () => {
    const messengerText = `🏡 ${property.name}
💰 Total Price: ${formatCurrency(property.price)}
📉 Monthly: ${formatCurrency(monthlyAmortization)}
✅ Required Income: ${formatCurrency(requiredIncome)}
📍 Location: ${property.location}

🔗 View Details: ${shareLink}`;

    try {
      await navigator.clipboard.writeText(messengerText);
      setMessengerCopied(true);
      toast({
        title: "Copied for Messenger!",
        description: "Paste this in your chat to share with clients.",
      });
      setTimeout(() => setMessengerCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Share2 className="h-4 w-4 mr-2" />
          Share with Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Property</DialogTitle>
          <DialogDescription>
            Generate a locked link that captures client leads before showing full details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4 text-accent" />
              Locked Link
            </label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="bg-muted" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className={copied ? "bg-success/10 text-success border-success" : ""}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Client will need to enter their details to unlock the computation.
            </p>
          </div>

          {/* Messenger Copy */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              Quick Share for Messenger
            </label>
            <Button
              variant="outline"
              className={`w-full justify-start ${messengerCopied ? "bg-success/10 text-success border-success" : ""}`}
              onClick={handleCopyMessenger}
            >
              {messengerCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy for Messenger
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Copies a formatted summary with price, monthly, and required income.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-muted rounded-lg p-4 text-sm font-mono">
            <p>🏡 {property.name}</p>
            <p>💰 Total Price: {formatCurrency(property.price)}</p>
            <p>📉 Monthly: {formatCurrency(monthlyAmortization)}</p>
            <p>✅ Required Income: {formatCurrency(requiredIncome)}</p>
            <p>📍 Location: {property.location}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;
