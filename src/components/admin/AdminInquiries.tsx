import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Mail, Clock, AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface InquiryResponse {
  id: string;
  message: string;
  admin_user_id: string;
  is_internal: boolean;
  created_at: string;
}

export const AdminInquiries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin-inquiries', statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['inquiry-responses', selectedInquiry?.id],
    queryFn: async () => {
      if (!selectedInquiry?.id) return [];
      
      const { data, error } = await supabase
        .from('inquiry_responses')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedInquiry?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
      toast({
        title: "Status updated",
        description: "Inquiry status has been updated successfully.",
      });
    },
  });

  const sendResponse = useMutation({
    mutationFn: async ({ inquiryId, message, isInternal }: { 
      inquiryId: string; 
      message: string; 
      isInternal: boolean; 
    }) => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Insert the response
      const { error } = await supabase
        .from('inquiry_responses')
        .insert({
          inquiry_id: inquiryId,
          admin_user_id: user.user.id,
          message,
          is_internal: isInternal,
        });

      if (error) throw error;

      // If not internal, create/update admin conversation and send email
      if (!isInternal) {
        const inquiry = inquiries?.find(i => i.id === inquiryId);
        if (inquiry) {
          // Find or create admin conversation (only if inquiry is tied to a user)
          let adminConv: any = null;
          if (inquiry.user_id) {
            const { data: existingConv, error: convError } = await supabase
              .from('admin_conversations')
              .select('*')
              .eq('inquiry_id', inquiryId)
              .single();

            if (convError && convError.code !== 'PGRST116') {
              throw convError;
            }

            adminConv = existingConv;

            if (!adminConv) {
              const { data: newConv, error: createError } = await supabase
                .from('admin_conversations')
                .insert({
                  user_id: inquiry.user_id,
                  inquiry_id: inquiryId,
                })
                .select()
                .single();

              if (createError) throw createError;
              adminConv = newConv;
            }

            // Add message to admin conversation
            const { error: msgError } = await supabase
              .from('admin_messages')
              .insert({
                conversation_id: adminConv.id,
                sender_id: user.user.id,
                is_admin: true,
                content: message,
              });

            if (msgError) throw msgError;
          } else {
            console.warn('Inquiry has no user_id; skipping admin_conversations creation. Email will still be sent.');
          }

          // Send email notification
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-inquiry-response-email', {
            body: {
              email: inquiry.email,
              name: inquiry.name,
              subject: inquiry.subject,
              message: message,
              inquiryId: inquiryId,
            },
          });

          if (emailError || (emailData as any)?.error) {
            console.error('Email sending failed:', emailError || (emailData as any)?.error);
            toast({
              title: 'Email not sent',
              description: 'We could not send the email notification. The reply is saved in the conversation.',
              variant: 'destructive',
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiry-responses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
      setResponseMessage('');
      setIsInternal(false);
      toast({
        title: "Response sent",
        description: "Your response has been sent successfully.",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading inquiries...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries List */}
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{inquiry.subject}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {inquiry.name} ({inquiry.email})
                    <span>•</span>
                    {format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(inquiry.priority)}>
                    {inquiry.priority}
                  </Badge>
                  <Badge className={getStatusColor(inquiry.status)}>
                    {getStatusIcon(inquiry.status)}
                    <span className="ml-1 capitalize">{inquiry.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Type: </span>
                  <Badge variant="outline" className="capitalize">
                    {inquiry.inquiry_type}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{inquiry.message}</p>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View & Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Inquiry Details & Responses</DialogTitle>
                      </DialogHeader>
                      
                      {selectedInquiry && (
                        <div className="space-y-6">
                          {/* Inquiry Details */}
                          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold">Original Inquiry</h3>
                            <div className="space-y-2">
                              <p><strong>Subject:</strong> {selectedInquiry.subject}</p>
                              <p><strong>Type:</strong> <Badge className="capitalize">{selectedInquiry.inquiry_type}</Badge></p>
                              <p><strong>From:</strong> {selectedInquiry.name} ({selectedInquiry.email})</p>
                              <p><strong>Date:</strong> {format(new Date(selectedInquiry.created_at), 'MMM dd, yyyy HH:mm')}</p>
                              <div>
                                <strong>Message:</strong>
                                <p className="mt-1 text-muted-foreground">{selectedInquiry.message}</p>
                              </div>
                            </div>
                          </div>

                          {/* Status Update */}
                          <div className="flex items-center gap-4">
                            <span className="font-medium">Status:</span>
                            <Select 
                              value={selectedInquiry.status} 
                              onValueChange={(status) => {
                                updateStatus.mutate({ id: selectedInquiry.id, status });
                                setSelectedInquiry({ ...selectedInquiry, status });
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Previous Responses */}
                          {responses.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="font-semibold">Previous Responses</h3>
                              {responses.map((response: InquiryResponse) => (
                                <div key={response.id} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant={response.is_internal ? "secondary" : "default"}>
                                      {response.is_internal ? "Internal Note" : "Customer Response"}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {format(new Date(response.created_at), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                  </div>
                                  <p className="text-sm">{response.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Send Response */}
                          <div className="space-y-4">
                            <h3 className="font-semibold">Send Response</h3>
                            <Textarea
                              placeholder="Type your response..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isInternal}
                                  onChange={(e) => setIsInternal(e.target.checked)}
                                />
                                <span className="text-sm">Internal note (not visible to customer)</span>
                              </label>
                              <Button
                                onClick={() => {
                                  if (responseMessage.trim() && selectedInquiry) {
                                    sendResponse.mutate({
                                      inquiryId: selectedInquiry.id,
                                      message: responseMessage,
                                      isInternal,
                                    });
                                  }
                                }}
                                disabled={!responseMessage.trim() || sendResponse.isPending}
                              >
                                {sendResponse.isPending ? "Sending..." : "Send Response"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inquiries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No inquiries found matching your filters.
        </div>
      )}
    </div>
  );
};