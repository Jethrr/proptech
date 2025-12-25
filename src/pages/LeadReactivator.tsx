import { useState, useEffect } from "react";
import { Upload, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CSVUpload from "@/components/LeadReactivator/CSVUpload";
import LeadList from "@/components/LeadReactivator/LeadList";
import { LeadForm } from "@/components/LeadReactivator/LeadForm";
import MessageGenerator from "@/components/LeadReactivator/MessageGenerator";
import { Lead } from "@/data/leads";
import { loadLeadsFromStorage, saveLeadsToStorage } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const LeadReactivator = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  useEffect(() => {
    // Load leads from storage
    const storedLeads = loadLeadsFromStorage();
    setLeads(storedLeads);
  }, []);

  const handleLeadsParsed = (newLeads: Lead[]) => {
    // Merge with existing leads, avoiding duplicates
    const existingIds = new Set(leads.map(l => l.id));
    const uniqueNewLeads = newLeads.filter(l => !existingIds.has(l.id));
    
    const updatedLeads = [...leads, ...uniqueNewLeads];
    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    
    toast({
      title: "Leads imported",
      description: `Successfully imported ${uniqueNewLeads.length} new lead${uniqueNewLeads.length > 1 ? "s" : ""}.`,
    });

    // Hide upload after import
    setShowUpload(false);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const handleMessagesSent = () => {
    // Update lead statuses to "Reactivated"
    const updatedLeads = leads.map(lead =>
      selectedLeads.includes(lead.id)
        ? { ...lead, status: "Reactivated" as const, lastInteraction: new Date().toISOString() }
        : lead
    );
    
    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    setSelectedLeads([]);
    setShowMessages(false);
    
    toast({
      title: "Leads reactivated",
      description: "Selected leads have been marked as reactivated.",
    });
  };

  const handleAddLead = () => {
    setEditingLead(undefined);
    setIsDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsDialogOpen(true);
  };

  const handleSaveLead = (leadData: Lead) => {
    let updatedLeads: Lead[];
    
    if (editingLead) {
      // Update existing lead
      updatedLeads = leads.map((l) =>
        l.id === editingLead.id ? leadData : l
      );
      toast({
        title: "Lead updated",
        description: `${leadData.name} has been updated successfully.`,
      });
    } else {
      // Add new lead
      updatedLeads = [...leads, leadData];
      toast({
        title: "Lead added",
        description: `${leadData.name} has been added successfully.`,
      });
    }

    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    setIsDialogOpen(false);
    setEditingLead(undefined);
  };

  const handleDeleteLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    const updatedLeads = leads.filter((l) => l.id !== leadId);
    setLeads(updatedLeads);
    saveLeadsToStorage(updatedLeads);
    
    // Remove from selected leads if it was selected
    setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    
    toast({
      title: "Lead deleted",
      description: lead ? `${lead.name} has been deleted.` : "Lead deleted.",
    });
  };

  const selectedLeadObjects = leads.filter(l => selectedLeads.includes(l.id));

  // Show message generator if selected
  if (showMessages && selectedLeadObjects.length > 0) {
    return (
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                Contact Leads
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowMessages(false)}
              >
                Back to Leads
              </Button>
            </div>
            <p className="text-muted-foreground">
              Generate personalized re-engagement messages for selected leads
            </p>
          </div>
          <MessageGenerator
            selectedLeads={selectedLeadObjects}
            onMessagesSent={handleMessagesSent}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              Manage Leads
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={handleAddLead}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpload(!showUpload)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {showUpload ? "Hide Upload" : "Import Leads"}
              </Button>
              {selectedLeads.length > 0 && (
                <Button
                  onClick={() => setShowMessages(true)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Generate Messages ({selectedLeads.length})
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Add, analyze leads, and generate personalized re-engagement messages
          </p>
        </div>

        {showUpload && (
          <div className="mb-6">
            <CSVUpload onLeadsParsed={handleLeadsParsed} />
          </div>
        )}

        <div className="space-y-6">
          <LeadList
            leads={leads}
            selectedLeads={selectedLeads}
            onSelectLead={handleSelectLead}
            onSelectAll={handleSelectAll}
            onImportClick={() => setShowUpload(true)}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
          />
          {selectedLeads.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setShowMessages(true)} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Generate Messages ({selectedLeads.length} selected)
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Lead Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </DialogTitle>
              <DialogDescription>
                {editingLead
                  ? "Update the lead information below."
                  : "Fill in the details to add a new lead to the database."}
              </DialogDescription>
            </DialogHeader>
            <LeadForm
              lead={editingLead}
              onSubmit={handleSaveLead}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingLead(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LeadReactivator;

