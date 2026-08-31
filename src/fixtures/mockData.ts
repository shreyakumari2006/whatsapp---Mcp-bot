import { PriorityTier } from '../bus.js';
export type { PriorityTier };

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  isVIP: boolean;
  vipTier?: 'TIER_1_EXECUTIVE' | 'TIER_2_CLIENT' | 'TIER_3_PARTNER';
  isGroup: boolean;
  groupName?: string;
  unreadCount?: number;
  lastActive?: number;
}

export interface AutoReplyRule {
  id: string;
  name: string;
  triggerPattern: string;
  triggerType: 'exact' | 'contains' | 'regex';
  replyMessage: string;
  cooldownMinutes: number;
  enabled: boolean;
  matchCount: number;
  createdAt: number;
  lastTriggeredAt?: number;
}

export interface MockMessage {
  id: string;
  from: string;
  senderName: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  groupName?: string;
  expectedPriority: PriorityTier;
  expectedAutoReplyTrigger?: string | null;
  scenarioDescription: string;
}

export const URGENCY_KEYWORDS = [
  'urgent',
  'asap',
  'emergency',
  'call me',
  'right now',
  'deadline',
  'otp',
  'failed',
  'down',
  'server down'
];

export const MOCK_CONTACTS: ContactItem[] = [
  {
    id: '1555019001@c.us',
    name: 'Sarah Chen (CEO)',
    phone: '+1 (555) 019-001',
    isVIP: true,
    vipTier: 'TIER_1_EXECUTIVE',
    isGroup: false,
    unreadCount: 1,
    lastActive: Date.now() - 1000 * 60 * 10
  },
  {
    id: '1555019002@c.us',
    name: 'David Miller (Key Client)',
    phone: '+1 (555) 019-002',
    isVIP: true,
    vipTier: 'TIER_2_CLIENT',
    isGroup: false,
    unreadCount: 0,
    lastActive: Date.now() - 1000 * 60 * 45
  },
  {
    id: '1555019003@c.us',
    name: 'DevOps Alert Bot',
    phone: '+1 (555) 019-003',
    isVIP: false,
    isGroup: false,
    unreadCount: 3,
    lastActive: Date.now() - 1000 * 60 * 2
  },
  {
    id: '1555019004@c.us',
    name: 'Alex Johnson (Colleague)',
    phone: '+1 (555) 019-004',
    isVIP: false,
    isGroup: false,
    unreadCount: 0,
    lastActive: Date.now() - 1000 * 60 * 120
  },
  {
    id: '1555019005@c.us',
    name: 'Random Inquirer',
    phone: '+1 (555) 019-005',
    isVIP: false,
    isGroup: false,
    unreadCount: 1,
    lastActive: Date.now() - 1000 * 60 * 12
  },
  {
    id: '1555019009@c.us',
    name: 'Promo Sender',
    phone: '+1 (555) 019-009',
    isVIP: false,
    isGroup: false,
    unreadCount: 1,
    lastActive: Date.now() - 1000 * 60 * 90
  },
  {
    id: '120363041234567890@g.us',
    name: 'Core Engineering War Room',
    phone: '',
    isVIP: false,
    isGroup: true,
    groupName: 'Core Engineering War Room',
    unreadCount: 5,
    lastActive: Date.now() - 1000 * 30
  }
];

export const MOCK_AUTO_REPLY_RULES: AutoReplyRule[] = [
  {
    id: 'rule_pricing_inquiry',
    name: 'Pricing & Service Inquiries',
    triggerPattern: 'pricing',
    triggerType: 'contains',
    replyMessage: 'Thanks for reaching out! You can view our standard pricing tiers and enterprise plans at https://example.com/pricing. Our team will review custom requests within 24 business hours.',
    cooldownMinutes: 60,
    enabled: true,
    matchCount: 14,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    lastTriggeredAt: Date.now() - 1000 * 60 * 90
  },
  {
    id: 'rule_office_hours',
    name: 'Schedule / Office Hours Auto-Response',
    triggerPattern: 'office hours',
    triggerType: 'contains',
    replyMessage: 'Hi! Our standard office hours are Mon-Fri 9:00 AM - 6:00 PM EST. For critical outages, ping the on-call engineer.',
    cooldownMinutes: 30,
    enabled: true,
    matchCount: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastTriggeredAt: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'rule_help_command',
    name: 'Help Command Trigger',
    triggerPattern: '^!help$',
    triggerType: 'regex',
    replyMessage: '🤖 WhatsApp MCP Assistant Menu:\n- Type "pricing" for pricing info\n- Type "office hours" for working hours\n- For urgent issues, please call directly.',
    cooldownMinutes: 5,
    enabled: true,
    matchCount: 22,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10
  },
  {
    id: 'rule_birthday_wishes',
    name: 'Birthday Wishes Responder',
    triggerPattern: 'birthday',
    triggerType: 'contains',
    replyMessage: 'Thank you so much for the birthday wishes! 🎉 Really appreciate you reaching out! 😊',
    cooldownMinutes: 60,
    enabled: true,
    matchCount: 0,
    createdAt: Date.now()
  }
];

export const MOCK_TEST_MESSAGES: MockMessage[] = [
  {
    id: 'msg_001',
    from: '1555019003@c.us',
    senderName: 'DevOps Alert Bot',
    body: 'CRITICAL ALERT: Production database cluster down and payment webhook failed! Emergency failover required ASAP. OTP for root access: 883921',
    timestamp: Date.now() - 1000 * 60 * 3,
    isGroup: false,
    expectedPriority: 'CRITICAL',
    expectedAutoReplyTrigger: null, // No auto-reply for critical/alerts
    scenarioDescription: 'Critical infrastructure failure containing multiple urgency triggers (down, failed, emergency, asap, otp)'
  },
  {
    id: 'msg_002',
    from: '1555019004@c.us',
    senderName: 'Alex Johnson (Colleague)',
    body: 'Hey, are you at your desk? Please call me right now, we have a hard deadline in 15 minutes for the client pitch.',
    timestamp: Date.now() - 1000 * 60 * 7,
    isGroup: false,
    expectedPriority: 'URGENT',
    expectedAutoReplyTrigger: null,
    scenarioDescription: 'Time-sensitive peer request with actionable keywords ("call me", "right now", "deadline")'
  },
  {
    id: 'msg_003',
    from: '1555019001@c.us',
    senderName: 'Sarah Chen (CEO)',
    body: 'Good morning Shreya, whenever you have a chance today, could you send over the updated roadmap summary?',
    timestamp: Date.now() - 1000 * 60 * 20,
    isGroup: false,
    expectedPriority: 'VIP',
    expectedAutoReplyTrigger: null, // VIPs are never auto-replied
    scenarioDescription: 'Calm message from a Tier 1 VIP (Executive)'
  },
  {
    id: 'msg_004',
    from: '1555019002@c.us',
    senderName: 'David Miller (Key Client)',
    body: 'Could you share the pricing breakdown for 500 seats when you get a moment?',
    timestamp: Date.now() - 1000 * 60 * 35,
    isGroup: false,
    expectedPriority: 'VIP',
    expectedAutoReplyTrigger: null, // VIPs are never auto-replied even if matching 'pricing'
    scenarioDescription: 'VIP message matching auto-reply keyword "pricing" (must skip auto-reply because sender is VIP)'
  },
  {
    id: 'msg_005',
    from: '1555019005@c.us',
    senderName: 'Random Inquirer',
    body: 'Hi there! We are interested in your enterprise services. What is your pricing model?',
    timestamp: Date.now() - 1000 * 60 * 12,
    isGroup: false,
    expectedPriority: 'NORMAL',
    expectedAutoReplyTrigger: 'rule_pricing_inquiry',
    scenarioDescription: 'Non-VIP customer asking for pricing (triggers pricing auto-reply)'
  },
  {
    id: 'msg_006',
    from: '120363041234567890@g.us',
    senderName: 'Core Engineering War Room',
    body: 'Hey team, what are our office hours support coverage for this upcoming long weekend?',
    timestamp: Date.now() - 1000 * 60 * 5,
    isGroup: true,
    groupName: 'Core Engineering War Room',
    expectedPriority: 'NORMAL',
    expectedAutoReplyTrigger: null, // Group chats must NOT trigger auto-reply
    scenarioDescription: 'Group chat matching "office hours" (must skip auto-reply because it is a group)'
  },
  {
    id: 'msg_007',
    from: '1555019005@c.us',
    senderName: 'Random Inquirer',
    body: 'Can you remind me of the pricing details again?',
    timestamp: Date.now() - 1000 * 60 * 2, // 10 minutes after previous message from same sender
    isGroup: false,
    expectedPriority: 'NORMAL',
    expectedAutoReplyTrigger: null, // Cooldown is 60 min, so this should be blocked by cooldown
    scenarioDescription: 'Repeated query within 60-min cooldown window (must suppress auto-reply duplicate)'
  },
  {
    id: 'msg_008',
    from: '1555019009@c.us',
    senderName: 'Promo Sender',
    body: 'Happy holidays! Wishing you and your family joy and prosperity this season! 🎄✨',
    timestamp: Date.now() - 1000 * 60 * 90,
    isGroup: false,
    expectedPriority: 'NOISE',
    expectedAutoReplyTrigger: null,
    scenarioDescription: 'Generic broadcast / holiday greeting with zero actionable intent'
  }
];
