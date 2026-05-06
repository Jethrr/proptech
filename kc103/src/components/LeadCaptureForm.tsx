import { useState } from "react";
import { Lock, User, Phone, Mail, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface LeadCaptureFormProps {
  projectName: string;
  onUnlock: (leadData: LeadData) => void;
}

export interface LeadData {
  name: string;
  phone: string;
  email: string;
}

const LeadCaptureForm = ({ projectName, onUnlock }: LeadCaptureFormProps) => {
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to unlock the computation.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "🎉 Access Granted!",
      description: "You now have full access to the property details.",
    });
    
    onUnlock(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card rounded-xl p-6 max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Unlock Full Computation</h3>
        <p className="text-muted-foreground text-sm">
          Enter your details to view the complete pricing and financial breakdown for{" "}
          <span className="font-medium text-foreground">{projectName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              placeholder="Juan dela Cruz"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+63 912 345 6789"
              value={formData.phone}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@email.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Unlocking...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Unlock Full Details
            </span>
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Your information is secure and will only be shared with the property agent.
      </p>
    </div>
  );
};

export default LeadCaptureForm;
