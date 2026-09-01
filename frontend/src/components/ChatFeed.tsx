import React from 'react';
import { Flame, Crown, Users, User, Zap } from 'lucide-react';
import type { PriorityTier, ChatMessage, ConversationSession } from '../types/whatsapp';

export interface ChatThreadItem {
  chatId: string;
  senderName: string;
  isGroup: boolean;
  priority: PriorityTier;
  isVIP: boolean;
  lastMessage: ChatMessage;
  messages: ChatMessage[];
}

interface ChatFeedProps {
  activeTab: 'ALL' | 'URGENT' | 'VIP' | 'APPROVALS';
  setActiveTab: (tab: 'ALL' | 'URGENT' | 'VIP' | 'APPROVALS') => void;
  filteredChats: ChatThreadItem[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  activeFlows?: ConversationSession[];
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  activeTab,
  setActiveTab,
  filteredChats,
  selectedChatId,
  onSelectChat,
  activeFlows = []
}) => {
  const renderPriorityPill = (tier: PriorityTier) => {
    const styles: Record<PriorityTier, string> = {
      CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
      URGENT: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      VIP: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      NORMAL: 'bg-blue-50 text-blue-700 border-blue-200',
      NOISE: 'bg-slate-100 text-slate-500 border-slate-200'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border tracking-wider ${styles[tier] || styles.NORMAL}`}>
        {tier}
      </span>
    );
  };

  return (
    <aside className="w-80 border-r border-slate-200 bg-white flex flex-col z-10">
      <div className="p-2 border-b border-slate-200 bg-slate-50/60 flex gap-1 text-[11px] font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('URGENT')}
          className={`flex-1 py-1.5 rounded-md text-center flex items-center justify-center gap-1 transition-all ${activeTab === 'URGENT' ? 'bg-white text-rose-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
        >
          <Flame size={12} className="text-rose-600" /> Urgent
        </button>
        <button
          onClick={() => setActiveTab('VIP')}
          className={`flex-1 py-1.5 rounded-md text-center flex items-center justify-center gap-1 transition-all ${activeTab === 'VIP' ? 'bg-white text-purple-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
        >
          <Crown size={12} className="text-purple-600" /> VIPs
        </button>
        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${activeTab === 'APPROVALS' ? 'bg-white text-amber-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
            }`}
        >
          Staged
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No conversations found in this view.
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = selectedChatId === chat.chatId;
            const isCrit = chat.priority === 'CRITICAL';
            const isUrg = chat.priority === 'URGENT';
            const isVip = chat.isVIP;

            return (
              <div
                key={chat.chatId}
                onClick={() => onSelectChat(chat.chatId)}
                className={`p-3.5 cursor-pointer transition-all border-l-4 ${isSelected
                    ? 'bg-slate-50 border-emerald-600 shadow-xs'
                    : isCrit
                      ? 'border-rose-500 hover:bg-rose-50/40'
                      : isUrg
                        ? 'border-amber-500 hover:bg-amber-50/40'
                        : isVip
                          ? 'border-purple-500 hover:bg-purple-50/40'
                          : 'border-transparent hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    {chat.isVIP ? (
                      <Crown size={13} className="text-purple-600 flex-shrink-0" />
                    ) : chat.isGroup ? (
                      <Users size={13} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <User size={13} className="text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {chat.senderName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {chat.lastMessage.body}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {renderPriorityPill(chat.priority)}
                    {activeFlows.some((f) => f.contactJid === chat.chatId) && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 animate-pulse">
                        <Zap size={10} className="fill-amber-500" /> Flow
                      </span>
                    )}
                  </div>
                  {chat.lastMessage.matchedKeywords && chat.lastMessage.matchedKeywords.length > 0 && (
                    <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      #{chat.lastMessage.matchedKeywords[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
