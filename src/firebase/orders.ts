import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './error';
import { OrderRecord, OrderStatus, StoreSettings } from '../types';

const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const DEFAULT_SETTINGS_DOC = 'main';

// 1. Create Order in Firestore
export async function createFirestoreOrder(order: OrderRecord): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderDocRef, {
      ...order,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// 2. Real-time Subscription to a single order for Customer Live Tracking
export function subscribeToOrder(
  orderId: string,
  onOrder: (order: OrderRecord | null) => void
): Unsubscribe {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  const docRef = doc(db, ORDERS_COLLECTION, orderId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onOrder(snapshot.data() as OrderRecord);
      } else {
        onOrder(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// 3. Real-time Subscription to all orders for Staff Dashboard
export function subscribeToAllOrders(
  onOrders: (orders: OrderRecord[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = ORDERS_COLLECTION;
  const colRef = collection(db, ORDERS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: OrderRecord[] = [];
      snapshot.forEach((d) => {
        records.push(d.data() as OrderRecord);
      });
      // Sort newest first
      records.sort((a, b) => b.createdAtEpoch - a.createdAtEpoch);
      onOrders(records);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

// 4. Update Order Status in Firestore
export async function updateFirestoreOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  currentRecord: OrderRecord,
  note?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const now = new Date().toISOString();
    const updatedHistory = [
      ...currentRecord.statusHistory,
      {
        status: newStatus,
        timestamp: now,
        note: note ? note.trim() : undefined,
      },
    ];

    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: now,
      statusHistory: updatedHistory,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 5. Fetch Store Settings from Firestore
export async function getFirestoreStoreSettings(): Promise<StoreSettings | null> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as StoreSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// 6. Save Store Settings to Firestore
export async function saveFirestoreStoreSettings(settings: StoreSettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
