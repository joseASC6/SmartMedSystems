import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Thread {
  thread_id: number;
  subject: string;
  description: string | null;
  status: string;
  created_at: string;
  patient_name?: string;
}

interface Message {
  message_id: number;
  thread_id: number;
  user_id: string;
  content: string;
  sent_at: string;
  sender_name: string;
  is_system: boolean;
}

const CATEGORIES = [
  'Prescription',
  'Symptoms',
  'Appointment',
  'Insurance',
  'Other'
];

const Chat = () => {
  const { user, userRole } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.thread_id);
      const subscription = supabase
        .channel(`thread_${selectedThread.thread_id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${selectedThread.thread_id}`
        }, payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('threads')
        .select(`
          *,
          participants!inner(user_id),
          patients:participants!inner(
            users(first_name, last_name)
          )
        `);

      if (userRole === 'patient') {
        query = query.eq('participants.user_id', user?.id);
      } else {
        const { data: nurseThreads } = await supabase
          .from('participants')
          .select('thread_id')
          .eq('user_id', user?.id);

        const nurseThreadIds = nurseThreads?.map(t => t.thread_id) || [];
        
        query = query.or(`status.eq.open,thread_id.in.(${nurseThreadIds.join(',')})`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedThreads = data.map(thread => ({
        ...thread,
        patient_name: `${thread.patients[0].users.first_name} ${thread.patients[0].users.last_name}`
      }));

      setThreads(formattedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to load chat threads');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: number) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users(first_name, last_name)
        `)
        .eq('thread_id', threadId)
        .order('sent_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(message => ({
        ...message,
        sender_name: message.users ? `${message.users.first_name} ${message.users.last_name}` : 'System',
        is_system: message.content.includes('Patient is waiting for a nurse') || 
                  message.content.includes('Nurse has joined the chat') ||
                  message.content.includes('Chat closed by')
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleStartNewChat = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert({
          subject: category,
          description: description,
          status: 'open',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (threadError) throw threadError;

      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          thread_id: threadData.thread_id,
          user_id: user?.id,
          updated_at: new Date().toISOString()
        });

      if (participantError) throw participantError;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadData.thread_id,
          user_id: user?.id,
          content: 'Patient is waiting for a nurse.',
          sent_at: new Date().toISOString()
        });

      if (messageError) throw messageError;

      setShowNewChatForm(false);
      fetchThreads();
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError('Failed to start new chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptChat = async (thread: Thread) => {
    try {
      setIsLoading(true);
      setError('');

      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          thread_id: thread.thread_id,
          user_id: user?.id,
          updated_at: new Date().toISOString()
        });

      if (participantError) throw participantError;

      const { error: threadError } = await supabase
        .from('threads')
        .update({ status: 'in_progress' })
        .eq('thread_id', thread.thread_id);

      if (threadError) throw threadError;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: thread.thread_id,
          user_id: user?.id,
          content: 'Nurse has joined the chat.',
          sent_at: new Date().toISOString()
        });

      if (messageError) throw messageError;

      fetchThreads();
      setSelectedThread(thread);
    } catch (error) {
      console.error('Error accepting chat:', error);
      setError('Failed to accept chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread.thread_id,
          user_id: user?.id,
          content: newMessage.trim(),
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleEndChat = async () => {
    if (!selectedThread) return;

    try {
      setIsLoading(true);
      setError('');

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread.thread_id,
          user_id: user?.id,
          content: `Chat closed by ${userRole === 'patient' ? 'patient' : 'nurse'}.`,
          sent_at: new Date().toISOString()
        });

      if (messageError) throw messageError;

      const { error: threadError } = await supabase
        .from('threads')
        .update({ status: 'closed' })
        .eq('thread_id', selectedThread.thread_id);

      if (threadError) throw threadError;

      setSelectedThread(null);
      fetchThreads();
    } catch (error) {
      console.error('Error ending chat:', error);
      setError('Failed to end chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-12rem)]">
        <div className="w-1/3 bg-white rounded-lg shadow-lg mr-4 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chats</h2>
              {userRole === 'patient' && (
                <button
                  onClick={() => setShowNewChatForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  New Chat
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map(thread => (
              <div
                key={thread.thread_id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedThread?.thread_id === thread.thread_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{thread.subject}</h3>
                    <p className="text-sm text-gray-600">{thread.patient_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    thread.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    thread.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {thread.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(thread.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                {userRole !== 'patient' && thread.status === 'open' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptChat(thread);
                    }}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Accept Chat
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedThread ? (
          <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedThread.subject}</h2>
                <p className="text-sm text-gray-600">{selectedThread.patient_name}</p>
              </div>
              {selectedThread.status === 'in_progress' && (
                <button
                  onClick={handleEndChat}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  End Chat
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <div
                  key={message.message_id}
                  className={`mb-4 ${
                    message.is_system
                      ? 'flex justify-center'
                      : message.user_id === user?.id
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }`}
                >
                  {message.is_system ? (
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600">
                      {message.content}
                    </div>
                  ) : (
                    <div className={`max-w-[70%] ${
                      message.user_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                    } rounded-lg px-4 py-2`}>
                      <p className="text-sm font-medium mb-1">{message.sender_name}</p>
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {format(new Date(message.sent_at), 'h:mm a')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {selectedThread.status === 'in_progress' && (
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {showNewChatForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Start New Chat</h2>
              <button
                onClick={() => setShowNewChatForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What do you need help with?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Briefly describe your issue..."
                />
              </div>
              <button
                onClick={handleStartNewChat}
                disabled={!category || isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Starting Chat...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;