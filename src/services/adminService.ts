
import { db, ROOT_ADMIN_EMAILS, ROOT_ADMIN_PHONES } from './firebaseConfig';
import { Store } from '../types';

// Check if user is Root Admin
export const isRootAdmin = (email?: string | null, phone?: string | null): boolean => {
    if (email && ROOT_ADMIN_EMAILS.includes(email)) return true;
    if (phone && ROOT_ADMIN_PHONES.includes(phone)) return true;
    return false;
};

// Check if user owns a specific store
export const getManagedStore = async (email?: string | null, phone?: string | null): Promise<Store | null> => {
    try {
        const storesRef = db.collection('stores');
        let snapshot;

        if (email) {
            snapshot = await storesRef.where('ownerEmail', '==', email).get();
            if (!snapshot.empty) return snapshot.docs[0].data() as Store;
        }

        if (phone) {
            snapshot = await storesRef.where('ownerPhone', '==', phone).get();
            if (!snapshot.empty) return snapshot.docs[0].data() as Store;
        }

        return null;
    } catch (error) {
        console.error("Error checking store ownership:", error);
        return null;
    }
};

export const createStore = async (storeData: Store) => {
    // We use the storeId (slug) as the document ID for easy lookup
    await db.collection('stores').doc(storeData.storeId).set(storeData);
};

export const getAllStores = async (): Promise<Store[]> => {
    // Fetches all stores. We sort client-side to avoid Firestore composite index requirements for the public view.
    try {
        const snapshot = await db.collection('stores').get();
        const stores = snapshot.docs.map(doc => doc.data() as Store);
        // Sort by creation date descending (newest first)
        return stores.sort((a, b) => {
             const timeA = a.createdAt?.seconds || 0;
             const timeB = b.createdAt?.seconds || 0;
             return timeB - timeA;
        });
    } catch (e) {
        console.error("Error fetching stores:", e);
        return [];
    }
};

export const deleteStore = async (storeId: string) => {
    await db.collection('stores').doc(storeId).delete();
    // Note: In a production app, you would also recursively delete products/orders linked to this storeId
};
