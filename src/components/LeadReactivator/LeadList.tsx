import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, MoreVertical, Upload, Inbox, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, LeadStatus } from "@/data/leads";

interface LeadListProps {
  leads: Lead[];
  selectedLeads: string[];
  onSelectLead: (leadId: string) => void;
  onSelectAll: () => void;
  onImportClick?: () => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const LeadList = ({ leads, selectedLeads, onSelectLead, onSelectAll, onImportClick, onEditLead, onDeleteLead }: LeadListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sortField, setSortField] = useState<"name" | "lastInteraction" | "sentimentScore" | "status">("lastInteraction");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const statusColors: Record<LeadStatus, string> = {
    Cold: "bg-gray-500",
    Warm: "bg-yellow-500",
    Hot: "bg-green-500",
    Reactivated: "bg-blue-500",
  };

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortField === "lastInteraction") {
        aVal = new Date(a.lastInteraction).getTime();
        bVal = new Date(b.lastInteraction).getTime();
      } else if (sortField === "status") {
        const statusOrder = { Cold: 0, Warm: 1, Hot: 2, Reactivated: 3 };
        aVal = statusOrder[a.status];
        bVal = statusOrder[b.status];
      } else {
        aVal = a.sentimentScore;
        bVal = b.sentimentScore;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: "name" | "lastInteraction" | "sentimentScore" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  // Show empty state if no leads at all
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No leads yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get started by importing your leads from a CSV file. Upload your CRM export or lead database to begin reactivating dormant leads.
          </p>
          {onImportClick && (
            <Button onClick={onImportClick} className="gap-2">
              <Upload className="h-4 w-4" />
              Import Leads
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lead List</CardTitle>
            <CardDescription>
              {filteredAndSortedLeads.length} of {leads.length} leads
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
          >
            {selectedLeads.length === filteredAndSortedLeads.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Hot">Hot</SelectItem>
              <SelectItem value="Reactivated">Reactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredAndSortedLeads.length && filteredAndSortedLeads.length > 0}
                    onChange={onSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("name")}
                    className="h-8 -ml-3"
                  >
                    Name
                    <ArrowUpDown className="h-3 w-3 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("status")}
                    className="h-8 -ml-3"
                  >
                    Status
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("sentimentScore")}
                    className="h-8 -ml-3"
                  >
                    Sentiment
                    <ArrowUpDown className="h-3 w-3 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("lastInteraction")}
                    className="h-8 -ml-3"
                  >
                    Last Interaction
                    <ArrowUpDown className="h-3 w-3 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <TableRow key={lead.id} className={selectedLeads.includes(lead.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => onSelectLead(lead.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lead.email}</div>
                        <div className="text-muted-foreground">{lead.contact}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lead.source}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[lead.status]} text-white`}
                        variant="secondary"
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              lead.sentimentScore >= 70
                                ? "bg-green-500"
                                : lead.sentimentScore >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${lead.sentimentScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{lead.sentimentScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.lastInteraction)}
                    </TableCell>
                    <TableCell>
                      {(onEditLead || onDeleteLead) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEditLead && (
                              <DropdownMenuItem onClick={() => onEditLead(lead)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDeleteLead && (
                              <DropdownMenuItem
                                onClick={() => onDeleteLead(lead.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadList;

