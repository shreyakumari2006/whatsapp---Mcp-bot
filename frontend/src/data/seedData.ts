import type { ChatMessage, AutoReplyRule, PendingApproval, AuditLogEntry, PaymentTarget } from '../types/whatsapp';

export const SEED_PAYMENT_TARGETS: PaymentTarget[] = [
  {
    id: 'pay_target_1',
    name: 'Abdhur Rahman',
    phone: '+91 98765 43210',
    contactJid: '919876543210@c.us',
    amount: 2500,
    currency: 'INR',
    reason: 'Server hosting',
    stage: 'WARMUP_CHECKIN',
    lastUpdated: Date.now() - 3600000 * 4
  },
  {
    id: 'pay_target_2',
    name: 'Ekansh Patil',
    phone: '+91 98765 43211',
    contactJid: '919876543211@c.us',
    amount: 1800,
    currency: 'INR',
    reason: 'API credits',
    stage: 'CONTEXT_BRIDGE',
    lastMessageSent: "Hey Ekansh! Hope everything is going well with the project launch.",
    lastUpdated: Date.now() - 3600000 * 2
  },
  {
    id: 'pay_target_3',
    name: 'Shreya Pandey',
    phone: '+91 98765 43212',
    contactJid: '919876543212@c.us',
    amount: 3200,
    currency: 'INR',
    reason: 'Design assets',
    stage: 'WARMUP_CHECKIN',
    lastUpdated: Date.now() - 3600000 * 6
  }
];

export const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_001',
    from: '1555019003@c.us',
    senderName: 'DevOps Alert Bot',
    body: 'CRITICAL ALERT: Production database cluster down and payment webhook failed! Emergency failover required ASAP. OTP for root access: 883921',
    timestamp: Date.now() - 1000 * 60 * 3,
    priority: 'CRITICAL',
    isGroup: false,
    matchedKeywords: ['down', 'failed', 'emergency', 'asap', 'otp'],
    urgencyScore: 10
  },
  {
    id: 'msg_002',
    from: '1555019004@c.us',
    senderName: 'Alex Johnson (Colleague)',
    body: 'Hey, are you at your desk? Please call me right now, we have a hard deadline in 15 minutes for the client pitch.',
    timestamp: Date.now() - 1000 * 60 * 7,
    priority: 'URGENT',
    isGroup: false,
    matchedKeywords: ['call me', 'right now', 'deadline'],
    urgencyScore: 8
  },
  {
    id: 'msg_003',
    from: '1555019001@c.us',
    senderName: 'Sarah Chen (CEO)',
    body: 'Good morning Shreya, whenever you have a chance today, could you send over the updated roadmap summary?',
    timestamp: Date.now() - 1000 * 60 * 25,
    priority: 'VIP',
    isGroup: false,
    matchedKeywords: ['roadmap'],
    urgencyScore: 6
  },
  {
    id: 'msg_004',
    from: '1555019002@c.us',
    senderName: 'David Miller (Key Client)',
    body: 'Could you share the pricing breakdown for 500 seats when you get a moment?',
    timestamp: Date.now() - 1000 * 60 * 45,
    priority: 'VIP',
    isGroup: false,
    matchedKeywords: ['pricing'],
    urgencyScore: 5
  },
  {
    id: 'msg_005',
    from: '1555019005@c.us',
    senderName: 'Random Inquirer',
    body: 'Hi there! We are interested in your enterprise services. What is your pricing model?',
    timestamp: Date.now() - 1000 * 60 * 65,
    priority: 'NORMAL',
    isGroup: false,
    matchedKeywords: ['pricing'],
    urgencyScore: 3
  },
  {
    id: 'msg_006',
    from: '1203630291823910@g.us',
    senderName: 'Elena Rostova',
    groupName: 'Core Engineering War Room',
    body: 'Hey team, what are our office hours support coverage for this upcoming long weekend?',
    timestamp: Date.now() - 1000 * 60 * 120,
    priority: 'NORMAL',
    isGroup: true,
    matchedKeywords: ['office hours'],
    urgencyScore: 2
  },
  {
    id: 'msg_007',
    from: '1555019008@c.us',
    senderName: 'Promo Sender',
    body: 'Happy holidays! Wishing you and your family joy and prosperity this season! 🎄✨',
    timestamp: Date.now() - 1000 * 60 * 240,
    priority: 'NOISE',
    isGroup: false,
    matchedKeywords: [],
    urgencyScore: 1
  },
  {
    id: 'msg_008',
    from: '919876543210@c.us',
    senderName: 'Abdhur Rahman',
    body: 'Hey Shreya! Yes, checking the accounts today, will clear the ₹2,500 server hosting balance shortly.',
    timestamp: Date.now() - 1000 * 60 * 15,
    priority: 'NORMAL',
    isGroup: false,
    matchedKeywords: ['server hosting'],
    urgencyScore: 4
  },
  {
    id: 'msg_009',
    from: '919876543211@c.us',
    senderName: 'Ekansh Patil',
    body: 'Thanks Shreya! Can you share the payment link or UPI ID for the ₹1,800 API credits?',
    timestamp: Date.now() - 1000 * 60 * 10,
    priority: 'URGENT',
    isGroup: false,
    matchedKeywords: ['api credits', 'payment'],
    urgencyScore: 7
  },
  {
    id: 'msg_010',
    from: '919876543212@c.us',
    senderName: 'Shreya Pandey',
    body: 'Hey Shreya, yes reviewing the ₹3,200 design assets invoice now! Everything looks good.',
    timestamp: Date.now() - 1000 * 60 * 5,
    priority: 'NORMAL',
    isGroup: false,
    matchedKeywords: ['design assets'],
    urgencyScore: 4
  }
];

export const SEED_RULES: AutoReplyRule[] = [
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
    name: 'Birthday Thanks & Party RSVP Flow',
    triggerPattern: 'birthday',
    triggerType: 'contains',
    replyMessage: 'Thank you so much for the birthday wishes! 🎉 Are you joining my birthday party tonight at 7 PM? (Reply Yes/No)',
    cooldownMinutes: 60,
    enabled: true,
    matchCount: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    type: 'flow',
    flowId: 'birthday_party_rsvp'
  }
];

export const SEED_ACTIVE_FLOWS = [
  {
    contactJid: '1555019004@c.us',
    senderName: 'Alex Johnson (Colleague)',
    flowId: 'birthday_party_rsvp',
    flowName: 'Birthday Thanks & Party RSVP Flow',
    currentStep: 'AWAITING_RSVP',
    contextData: { originalTrigger: 'Happy Birthday Shreya! Have a blast today! 🎂🎉' },
    lastUpdated: Date.now() - 1000 * 60 * 5,
    expiresAt: Date.now() + 1000 * 60 * 115
  }
];

export const SEED_PENDING_APPROVALS: PendingApproval[] = [
  {
    id: 'appr_seed_001',
    to: '1555019001@c.us',
    recipientName: 'Sarah Chen (CEO)',
    message: 'Hello Sarah, here is the updated executive roadmap summary you requested. Let me know if you would like me to adjust any milestones.',
    priority: 'VIP',
    createdAt: Date.now() - 1000 * 60 * 15,
    status: 'pending'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_01',
    timestamp: Date.now() - 1000 * 60 * 3,
    type: 'TRIAGE',
    action: '[FAST-PATH] Classified [CRITICAL] from DevOps Alert Bot',
    details: { from: '1555019003@c.us', keywords: ['down', 'failed', 'emergency', 'asap'] },
    level: 'error'
  },
  {
    id: 'audit_02',
    timestamp: Date.now() - 1000 * 60 * 25,
    type: 'TRIAGE',
    action: '[FAST-PATH] Classified [VIP] from Sarah Chen (CEO)',
    details: { from: '1555019001@c.us', tier: 'TIER_1_EXECUTIVE' },
    level: 'info'
  },
  {
    id: 'audit_03',
    timestamp: Date.now() - 1000 * 60 * 65,
    type: 'AUTO_REPLY',
    action: 'Dispatched Auto-Reply "Pricing & Service Inquiries" to Random Inquirer',
    details: { to: '1555019005@c.us', rule: 'rule_pricing_inquiry' },
    level: 'success'
  }
];
