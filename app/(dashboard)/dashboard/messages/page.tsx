"use client";
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Send, Search, User } from 'lucide-react';

export default function MessagesPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        setUserId(user.id);
        const { data } = await supabase
          .from('messages')
          .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)')
          .or('sender_id.eq.' + user.id + ',receiver_id.eq.' + user.id)
          .order('created_at', { ascending: false });
        
        const seen = new Set();
        const convs = [];
        for (const m of (data || [])) {
          const other = m.sender_id === user.id ? m.receiver : m.sender;
          if (!other || seen.has(other.id)) continue;
          seen.add(other.id);
          convs.push({ other, lastMessage: m });
        }
        setConversations(convs);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  async function openConversation(conv) {
    setSelected(conv);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or('and(sender_id.eq.' + userId + ',receiver_id.eq.' + conv.other.id + '),and(sender_id.eq.' + conv.other.id + ',receiver_id.eq.' + userId + ')')
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selected) return;
    setSending(true);
    await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: selected.other.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
    await openConversation(selected);
    setSending(false);
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  const filtered = conversations.filter(c =>
    c.other?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{height: '70vh'}}>
        <div className="flex h-full">

          {/* Liste conversations */}
          <div className={"flex flex-col border-r border-gray-100 " + (selected ? "hidden md:flex w-80" : "flex w-full md:w-80")}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-500 text-sm font-medium">Aucune conversation</p>
                  <p className="text-gray-400 text-xs mt-1">Contactez un prestataire depuis le dashboard</p>
                </div>
              ) : (
                filtered.map(conv => (
                  <button key={conv.other.id} onClick={() => openConversation(conv)} className={"w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left " + (selected?.other.id === conv.other.id ? "bg-blue-50" : "")}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {conv.other.avatar_url ? <img src={conv.other.avatar_url} className="w-10 h-10 object-cover" alt="" /> : <User size={18} className="text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">{conv.other.full_name}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(conv.lastMessage.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage.content}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Zone messages */}
          <div className={"flex-1 flex flex-col " + (!selected ? "hidden md:flex" : "flex")}>
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-gray-500 font-medium">Sélectionnez une conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <button onClick={() => setSelected(null)} className="md:hidden text-gray-400 mr-1">←</button>
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {selected.other.avatar_url ? <img src={selected.other.avatar_url} className="w-9 h-9 object-cover" alt="" /> : <User size={16} className="text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selected.other.full_name}</p>
                    <p className="text-xs text-green-500">En ligne</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={"flex " + (m.sender_id === userId ? "justify-end" : "justify-start")}>
                      <div className={"max-w-xs md:max-w-sm " + (m.sender_id === userId ? "items-end" : "items-start") + " flex flex-col"}>
                        <div className={"px-4 py-2.5 rounded-2xl text-sm " + (m.sender_id === userId ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm")}>
                          {m.content}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">{formatTime(m.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Écrire un message..."
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0">
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
