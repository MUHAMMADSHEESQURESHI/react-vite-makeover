import { useState, useEffect, useRef } from "react";
import TopBar, { type NavItem } from "@/components/TopBar";
import { messageAPI, type Conversation, type MessageData } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/messages", label: "Messages", key: "messages" },
];

interface Message {
  _id: string;
  sender: { _id: string; name: string; email: string };
  recipient: { _id: string; name: string; email: string };
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  skills?: string[];
}

const Messages = () => {
  const [userId, setUserId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setUserId("demo-user-1");
      localStorage.setItem("userId", "demo-user-1");
      localStorage.setItem("userName", storedUserName || "Demo User");
    }
  }, []);

  // Fetch conversations when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const result = await messageAPI.getConversations(userId);
        if (result.success) {
          setConversations(result.data);
        }
      } catch (error: any) {
        console.error("Fetch conversations error:", error);
        if (error.response?.status !== 404) {
          toast.error("Failed to load conversations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (!userId || !selectedContact) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const result = await messageAPI.getMessages(userId, selectedContact);
        if (result.success) {
          setMessages(result.data);
          await messageAPI.markAsRead(userId, selectedContact);
        }
      } catch (error: any) {
        console.error("Fetch messages error:", error);
        toast.error("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedContact, userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time polling for new messages (every 5 seconds)
  useEffect(() => {
    if (!userId || !selectedContact) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await messageAPI.getMessages(userId, selectedContact);
        if (result.success) {
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m._id));
            const newMessages = result.data.filter((m: Message) => !prevIds.has(m._id));
            if (newMessages.length > 0) {
              toast.success(`New message received!`);
              return [...prev, ...newMessages];
            }
            return prev;
          });
          await messageAPI.markAsRead(userId, selectedContact);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userId, selectedContact]);

  // Refresh conversations periodically
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const result = await messageAPI.getConversations(userId);
        if (result.success) {
          setConversations(result.data);
        }
      } catch (error) {
        console.error("Refresh conversations error:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedContact || !userId) return;

    try {
      const messageData: MessageData = {
        senderId: userId,
        recipientId: selectedContact,
        content: newMessage.trim(),
      };

      const result = await messageAPI.send(messageData);

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");

        // Update conversations list
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.contact.id === selectedContact) {
              return {
                ...conv,
                lastMessage: {
                  id: result.data._id,
                  content: result.data.content,
                  createdAt: result.data.createdAt,
                  isFromMe: true,
                  isRead: true,
                },
              };
            }
            return conv;
          });
          return updated.sort(
            (a, b) =>
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
          );
        });

        toast.success("Message sent!");
      }
    } catch (error: any) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleSelectConversation = (contactId: string) => {
    setSelectedContact(contactId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const result = await messageAPI.delete(messageId, userId);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        toast.success("Message deleted");
      }
    } catch (error: any) {
      console.error("Delete message error:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleComposeMessage = async (recipientId: string) => {
    try {
      const messageData: MessageData = {
        senderId: userId,
        recipientId,
        content: "Hi! I'd like to connect with you.",
      };

      const result = await messageAPI.send(messageData);

      if (result.success) {
        toast.success("Message sent!");
        setComposeOpen(false);

        // Refresh conversations
        const convResult = await messageAPI.getConversations(userId);
        if (convResult.success) {
          setConversations(convResult.data);
        }

        // Select the new conversation
        setSelectedContact(recipientId);
      }
    } catch (error: any) {
      console.error("Compose message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await messageAPI.getAllUsers(userId);
      if (result.success) {
        setAllUsers(result.data);
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenCompose = () => {
    fetchAllUsers();
    setComposeOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSelectedContactName = () => {
    const conv = conversations.find((c) => c.contact.id === selectedContact);
    return conv?.contact.name || "Unknown";
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TopBar links={links} activeKey="messages" />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Interaction / Messaging</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Keep support moving through direct communication.
            </h1>
            <p>
              Basic messaging gives helpers and requesters a clear follow-up path
              once a match happens.
            </p>
          </div>
        </section>

        <section className="detail-grid section" style={{ gridTemplateColumns: "1fr 2fr", minHeight: "500px" }}>
          {/* Conversations List */}
          <Card className="form-card">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Conversations</h3>
                  <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenCompose}
                        className="text-xs"
                      >
                        New Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Compose New Message</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {usersLoading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : (
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {allUsers
                                .filter((user) =>
                                  user.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((user) => (
                                  <button
                                    key={user._id}
                                    onClick={() => handleComposeMessage(user._id)}
                                    className="w-full p-3 text-left hover:bg-muted rounded-lg border transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-xs font-semibold">
                                          {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {user.email}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-8"
                  />
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchQuery ? (
                      <p>No conversations match your search</p>
                    ) : (
                      <>
                        <p>No conversations yet</p>
                        <p className="text-sm">Start a conversation from a help request!</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.contact.id}
                        onClick={() => handleSelectConversation(conv.contact.id)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${
                          selectedContact === conv.contact.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-semibold">
                              {conv.contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{conv.contact.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(conv.lastMessage.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage.isFromMe && (
                                <span className="text-xs">You: </span>
                              )}
                              {conv.lastMessage.content}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[#13ac9c] text-white rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Thread */}
          <Card className="form-card flex flex-col">
            <CardContent className="p-0 flex flex-col h-[600px]">
              {selectedContact ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-semibold">
                        {getSelectedContactName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getSelectedContactName()}</h3>
                      <p className="text-xs text-muted-foreground">
                        {messagesLoading ? "Loading..." : "Active now"}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12 w-3/4" />
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet</p>
                        <p className="text-sm">Say hello to start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isFromMe = msg.sender._id === userId;
                          return (
                            <div
                              key={msg._id}
                              className={`flex group ${isFromMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-lg px-4 py-2 relative ${
                                  isFromMe
                                    ? "bg-[#13ac9c] text-white"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <div
                                  className={`flex items-center gap-2 mt-1 ${
                                    isFromMe ? "text-white/70" : "text-muted-foreground"
                                  }`}
                                >
                                  <p className="text-xs">
                                    {formatRelativeTime(msg.createdAt)}
                                  </p>
                                  {isFromMe && (
                                    <button
                                      onClick={() => handleDeleteMessage(msg._id)}
                                      className="text-xs opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity"
                                      title="Delete message"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-[#13ac9c] hover:bg-[#0f8f7f]"
                      disabled={!newMessage.trim() || messagesLoading}
                    >
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a contact from the list to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Messages;
