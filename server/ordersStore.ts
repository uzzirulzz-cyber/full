import fs from 'fs';
import path from 'path';
import type { OrderRecord } from '../src/types/store.ts';

const DATA_DIR = process.env.VERCEL ? '/tmp/playbeat-digital' : path.resolve(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

export interface WebhookEventLog {
  id: string;
  receivedAt: string;
  provider: 'rapid-gateway' | 'paypal' | 'electronicfirst';
  eventType: string;
  signatureValid: boolean;
  sessionId?: string;
  orderId?: string;
  payloadSummary: string;
}

interface PersistedData {
  orders: OrderRecord[];
  webhookLogs: WebhookEventLog[];
}

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    const initial: PersistedData = { orders: [], webhookLogs: [] };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readData(): PersistedData {
  ensureStore();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as PersistedData;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      webhookLogs: Array.isArray(parsed.webhookLogs) ? parsed.webhookLogs : [],
    };
  } catch {
    return { orders: [], webhookLogs: [] };
  }
}

function writeData(data: PersistedData): void {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function listOrders(): OrderRecord[] {
  return readData().orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getOrderById(orderId: string): OrderRecord | undefined {
  return readData().orders.find((o) => o.orderId === orderId);
}

export function getOrderByRapidSessionId(sessionId: string): OrderRecord | undefined {
  return readData().orders.find((o) => o.rapidSessionId === sessionId);
}

export function getOrderByPaypalOrderId(paypalOrderId: string): OrderRecord | undefined {
  return readData().orders.find((o) => o.paypalOrderId === paypalOrderId);
}

export function saveOrder(order: OrderRecord): OrderRecord {
  const data = readData();
  const idx = data.orders.findIndex((o) => o.orderId === order.orderId);
  if (idx >= 0) {
    data.orders[idx] = order;
  } else {
    data.orders.unshift(order);
  }
  writeData(data);
  return order;
}

export function appendWebhookLog(log: WebhookEventLog): void {
  const data = readData();
  data.webhookLogs.unshift(log);
  data.webhookLogs = data.webhookLogs.slice(0, 50);
  writeData(data);
}

export function listWebhookLogs(): WebhookEventLog[] {
  return readData().webhookLogs;
}
