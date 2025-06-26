
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Eye, Check, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportedListing {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_category: string;
  reporter_username: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export const AdminListingModeration = () => {
  const [reports, setReports] = useState<ReportedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // First get the reported listings
      const { data: reportedListings, error: reportsError } = await supabase
        .from('reported_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      if (!reportedListings || reportedListings.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get unique listing IDs and reporter IDs
      const listingIds = [...new Set(reportedListings.map(r => r.listing_id))];
      const reporterIds = [...new Set(reportedListings.map(r => r.reporter_id))];

      // Fetch listings data
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, category')
        .in('id', listingIds);

      if (listingsError) throw listingsError;

      // Fetch reporter profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', reporterIds);

      if (profilesError) throw profilesError;

      // Create lookup maps
      const listingMap = new Map(listings?.map(l => [l.id, l]) || []);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine the data
      const formattedReports: ReportedListing[] = reportedListings.map(report => {
        const listing = listingMap.get(report.listing_id);
        const profile = profileMap.get(report.reporter_id);

        return {
          id: report.id,
          listing_id: report.listing_id,
          listing_title: listing?.title || 'Unknown Listing',
          listing_category: listing?.category || 'Unknown',
          reporter_username: profile?.username || 'Unknown User',
          reason: report.reason,
          description: report.description || '',
          status: report.status,
          created_at: report.created_at
        };
      });

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reported_listings')
        .update({
          status,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${status} successfully`,
      });
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesSearch = report.listing_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading reports...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>
            Review and manage reported listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.listing_title}</div>
                        <div className="text-sm text-gray-500">{report.listing_category}</div>
                      </div>
                    </TableCell>
                    <TableCell>@{report.reporter_username}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.reason}</div>
                        {report.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {report.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          report.status === 'pending' ? 'destructive' :
                          report.status === 'resolved' ? 'default' : 'secondary'
                        }
                      >
                        {report.status === 'pending' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
