import { eventBus } from '../bus.js';

export type PaymentStage = 'WARMUP_CHECKIN' | 'CONTEXT_BRIDGE' | 'PAYMENT_LINK_SENT' | 'PAID';

export interface PaymentTarget {
  id: string;
  name: string;
  phone: string;
  contactJid: string;
  amount: number; // in INR ₹
  currency: string;
  reason: string;
  stage: PaymentStage;
  lastMessageSent?: string;
  lastUpdated: number;
}

export const SEEDED_PAYMENT_TARGETS: PaymentTarget[] = [
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

export class PaymentCollectionManager {
  private targets: Map<string, PaymentTarget> = new Map();

  constructor() {
    for (const t of SEEDED_PAYMENT_TARGETS) {
      this.targets.set(t.id, { ...t });
    }
  }

  public getTargets(): PaymentTarget[] {
    return Array.from(this.targets.values());
  }

  public getTarget(id: string): PaymentTarget | undefined {
    return this.targets.get(id);
  }

  public getTargetByJid(contactJid: string): PaymentTarget | undefined {
    return Array.from(this.targets.values()).find(t => t.contactJid === contactJid);
  }

  public initiateCheckin(id: string): { target: PaymentTarget; message: string } | null {
    const target = this.targets.get(id);
    if (!target) return null;

    const firstName = target.name.split(' ')[0];
    const message = `Hey ${firstName}! Hope you're having a productive week 😊 How's everything going with your recent project?`;
    target.stage = 'CONTEXT_BRIDGE';
    target.lastMessageSent = message;
    target.lastUpdated = Date.now();

    eventBus.emit('payment_state_update' as any, {
      target,
      action: 'checkin_initiated',
      timestamp: Date.now()
    });

    return { target, message };
  }

  public dispatchPaymentRequest(id: string): { target: PaymentTarget; message: string } | null {
    const target = this.targets.get(id);
    if (!target) return null;

    const firstName = target.name.split(' ')[0];
    const paymentLink = `https://pay.upi/settle/${target.id}?amt=${target.amount}`;
    const message = `Hey ${firstName}, just following up on our settlement for ${target.reason} (₹${target.amount.toLocaleString('en-IN')}). Whenever you get a chance, you can complete the transfer here: ${paymentLink}\n\nLet me know once done! Cheers ✨`;

    target.stage = 'PAYMENT_LINK_SENT';
    target.lastMessageSent = message;
    target.lastUpdated = Date.now();

    eventBus.emit('payment_state_update' as any, {
      target,
      action: 'payment_link_dispatched',
      timestamp: Date.now()
    });

    return { target, message };
  }

  public markSettled(id: string): PaymentTarget | null {
    const target = this.targets.get(id);
    if (!target) return null;

    target.stage = 'PAID';
    target.lastUpdated = Date.now();

    eventBus.emit('payment_state_update' as any, {
      target,
      action: 'marked_settled',
      timestamp: Date.now()
    });

    return target;
  }
}

export const paymentManager = new PaymentCollectionManager();
