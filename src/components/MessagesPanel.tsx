
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessagesPanelProps {
  onBack: () => void;
}

export const MessagesPanel = ({ onBack }: MessagesPanelProps) => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: 1,
      partner: "Sarah M.",
      avatar: "S",
      lastMessage: "That sounds perfect! When would you like to meet?",
      time: "2m ago",
      unread: 2,
      item: "Coffee Maker → Books",
      status: "matched"
    },
    {
      id: 2,
      partner: "Mike K.",
      avatar: "M",
      lastMessage: "Thanks for the swap! The books are amazing.",
      time: "1h ago",
      unread: 0,
      item: "Programming Books → Guitar",
      status: "completed"
    },
    {
      id: 3,
      partner: "Emma L.",
      avatar: "E",
      lastMessage: "Hi! I'm interested in your yoga mat.",
      time: "3h ago",
      unread: 1,
      item: "Plant Collection → Yoga Mat",
      status: "pending"
    }
  ];

  const messages = {
    1: [
      { id: 1, sender: "partner", text: "Hi! I saw you're interested in my book collection.", time: "10:30 AM" },
      { id: 2, sender: "me", text: "Yes! I have a coffee maker that I think you'd love.", time: "10:32 AM" },
      { id: 3, sender: "partner", text: "That sounds perfect! I've been looking for one. Can you tell me more about it?", time: "10:35 AM" },
      { id: 4, sender: "me", text: "It's a vintage Chemex, barely used. Great for pour-over coffee!", time: "10:37 AM" },
      { id: 5, sender: "partner", text: "That sounds perfect! When would you like to meet?", time: "10:40 AM" }
    ]
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      console.log(`Sending message to chat ${selectedChat}: ${newMessage}`);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedChat === conv.id ? 'bg-blue-50 border-blue-200 border' : 'border border-transparent'
                      }`}
                      onClick={() => setSelectedChat(conv.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">{conv.partner}</div>
                            <div className="text-xs text-gray-500">{conv.time}</div>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <RotateCcw className="w-3 h-3 text-gray-400" />
                            <div className="text-xs text-gray-600 truncate">{conv.item}</div>
                          </div>
                          <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge 
                              variant={conv.status === 'completed' ? 'default' : conv.status === 'matched' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {conv.status}
                            </Badge>
                            {conv.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversations.find(c => c.id === selectedChat)?.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.id === selectedChat)?.partner}
                      </CardTitle>
                      <div className="text-sm text-gray-600 flex items-center">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {conversations.find(c => c.id === selectedChat)?.item}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[450px]">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {(messages[selectedChat as keyof typeof messages] || []).map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.sender === 'me'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm">{message.text}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
