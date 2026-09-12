import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Mail, Phone, Clock, CheckCircle, Tag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  new: 'bg-red-100 text-red-700 border-red-200',
  read: 'bg-gray-100 text-gray-600 border-gray-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      setMessages(res.data.data.contacts);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(prev =>
        prev.map(m => m._id === id ? { ...m, status: 'read' } : m)
      );
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleReply = async (id, e) => {
    e.stopPropagation();
    const text = replyText[id]?.trim();
    if (!text) { toast.error('Please write a reply first'); return; }
    setSending(id);
    try {
      await api.post(`/contact/${id}/reply`, { replyMessage: text });
      toast.success('Reply sent successfully');
      setReplyText(prev => ({ ...prev, [id]: '' }));
      setMessages(prev =>
        prev.map(m => m._id === id ? { ...m, status: 'replied' } : m)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    // Auto-mark as read when opened
    const msg = messages.find(m => m._id === id);
    if (msg && msg.status === 'new') {
      api.put(`/contact/${id}/read`).then(() => {
        setMessages(prev =>
          prev.map(m => m._id === id ? { ...m, status: 'read' } : m)
        );
      }).catch(() => {});
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const newCount = messages.filter(m => m.status === 'new').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
            <Mail className="w-7 h-7" /> Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Customer enquiries from the Contact Us page
            {newCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {newCount} new
              </span>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['all', 'new', 'read', 'replied'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg._id}
              className={`card overflow-hidden cursor-pointer transition hover:shadow-md ${
                msg.status === 'new' ? 'border-l-4 border-l-red-500' : ''
              }`}
              onClick={() => toggleExpand(msg._id)}
            >
              {/* Header row */}
              <div className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-sm">
                    {msg.name?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{msg.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[msg.status]}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                  {expandedId === msg._id
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>

              {/* Expanded body */}
              {expandedId === msg._id && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-4">
                  {/* Contact details */}
                  <div className="flex flex-wrap gap-4 pt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-primary-500" />
                      <a href={`mailto:${msg.email}`} className="text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>
                        {msg.email}
                      </a>
                    </span>
                    {msg.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-primary-500" />
                        {msg.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-primary-500" />
                      {msg.subject}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary-500" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                  </div>

                  {/* Reply form */}
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700">
                      Reply to {msg.name} — will be sent from bereketmillion8@gmail.com
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`Write your reply to ${msg.name}...`}
                      value={replyText[msg._id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [msg._id]: e.target.value }))}
                      className="input-field resize-none w-full"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => handleReply(msg._id, e)}
                        disabled={sending === msg._id}
                        className="btn-primary flex items-center gap-2 text-sm py-2 disabled:opacity-50"
                      >
                        {sending === msg._id
                          ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          : <Send className="w-4 h-4" />
                        }
                        {sending === msg._id ? 'Sending...' : 'Send Reply'}
                      </button>
                      {msg.status === 'new' && (
                        <button
                          onClick={(e) => handleMarkRead(msg._id, e)}
                          className="btn-outline flex items-center gap-2 text-sm py-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
