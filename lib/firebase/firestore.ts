import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy, limit, deleteDoc, getDoc } from "firebase/firestore";
import { app } from "./config";
import { LotteryRound, PaymentMethod, TelegramSettings, PurchaseOrder } from "../../types";

export const db = getFirestore(app);

/**
 * Saves or updates a payment method.
 */
export const savePaymentMethod = async (paymentData: PaymentMethod) => {
   try {
      const paymentRef = doc(db, "payment_methods", paymentData.id);
      await setDoc(paymentRef, paymentData);
      return { id: paymentData.id };
   } catch (error) {
      console.error("Error saving payment method:", error);
      throw error;
   }
};

/**
 * Fetches all available payment methods.
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
   try {
      const paymentsRef = collection(db, "payment_methods");
      const querySnapshot = await getDocs(paymentsRef);
      const methods: PaymentMethod[] = [];
      querySnapshot.forEach((doc) => {
         methods.push({ ...doc.data(), id: doc.id } as PaymentMethod);
      });
      return methods;
   } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
   }
};

/**
 * Creates a single LotteryRound record with all embedded car metadata.
 */
export const addLotteryRound = async (
   lotteryData: Omit<LotteryRound, 'id' | 'status' | 'soldTickets' | 'startDate' | 'initialSoldPercent'> & { initialSoldPercent?: number }
) => {
   try {
      const roundRef = doc(collection(db, "lottery_rounds"));

      const newRound: LotteryRound = {
         id: roundRef.id,
         ...lotteryData,
         soldTickets: 0,
         numbersPerTicket: lotteryData.numbersPerTicket || 1,
         status: 'active',
         startDate: new Date(),
         // Ensure drawDate is properly saved as a Date object before writing
         drawDate: new Date(lotteryData.drawDate)
      };

      await setDoc(roundRef, newRound);

      return { roundId: roundRef.id };
   } catch (error) {
      console.error("Error adding lottery round:", error);
      throw error;
   }
};

/**
 * Fetches all lottery rounds from the collection.
 */
export const getAllLotteryRounds = async (): Promise<LotteryRound[]> => {
   try {
      const lotteriesRef = collection(db, "lottery_rounds");
      const q = query(lotteriesRef, orderBy("startDate", "desc"));
      const querySnapshot = await getDocs(q);
      const host: LotteryRound[] = [];

      querySnapshot.forEach((doc) => {
         const data = doc.data();
         const startDate = data.startDate?.toDate ? data.startDate.toDate() : (data.startDate instanceof Date ? data.startDate : null);
         const drawDate = data.drawDate?.toDate ? data.drawDate.toDate() : (data.drawDate instanceof Date ? data.drawDate : null);

         host.push({
            ...data,
            id: doc.id,
            startDate,
            drawDate
         } as LotteryRound);
      });

      return host;
   } catch (error) {
      console.error("Error fetching all lottery rounds:", error);
      return [];
   }
};

/**
 * Updates an existing lottery round.
 */
export const updateLotteryRound = async (id: string, updates: Partial<LotteryRound>) => {
   try {
      const roundRef = doc(db, "lottery_rounds", id);
      
      // Ensure dates are handled if they are in the updates
      const dataToUpdate = { ...updates };
      if (updates.startDate) dataToUpdate.startDate = new Date(updates.startDate);
      if (updates.drawDate) dataToUpdate.drawDate = new Date(updates.drawDate);

      await setDoc(roundRef, dataToUpdate, { merge: true });
      return { success: true };
   } catch (error) {
      console.error("Error updating lottery round:", error);
      throw error;
   }
};

/**
 * Fetches the most recent active lottery rounds to display on the User side.
 */
export const getActiveLotteries = async (limitCount = 5): Promise<LotteryRound[]> => {
   try {
      const lotteriesRef = collection(db, "lottery_rounds");

      // Using a simple query without orderBy to avoid requiring a composite index
      // during initial development.
      const q = query(
         lotteriesRef,
         where("status", "==", "active"),
         limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const lotteries: any[] = [];

      querySnapshot.forEach((doc) => {
         const data = doc.data();

         // Robust conversion of Timestamps to Dates
         const startDate = data.startDate?.toDate ? data.startDate.toDate() : (data.startDate instanceof Date ? data.startDate : null);
         const drawDate = data.drawDate?.toDate ? data.drawDate.toDate() : (data.drawDate instanceof Date ? data.drawDate : null);

         lotteries.push({
            ...data,
            id: doc.id,
            startDate,
            drawDate
         });
      });

      // Filter out records without start dates and sort manually
      return lotteries
         .filter(l => l.startDate instanceof Date)
         .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
   } catch (error: any) {
      console.error("Error fetching active lotteries:", error.message);
      return [];
   }
};

/**
 * Fetches a single lottery round by ID.
 */
export const getLotteryRound = async (id: string): Promise<LotteryRound | null> => {
   try {
      const roundRef = doc(db, "lottery_rounds", id);
      const docSnap = await getDoc(roundRef);

      if (docSnap.exists()) {
         const data = docSnap.data();

         // Robust conversion of Timestamps to Dates
         const startDate = data.startDate?.toDate ? data.startDate.toDate() : (data.startDate instanceof Date ? data.startDate : null);
         const drawDate = data.drawDate?.toDate ? data.drawDate.toDate() : (data.drawDate instanceof Date ? data.drawDate : null);

         return {
            ...data,
            id: docSnap.id,
            startDate,
            drawDate
         } as LotteryRound;
      }
      return null;
   } catch (error) {
      console.error("Error fetching lottery round:", error);
      return null;
   }
};

/**
 * Saves or updates Telegram settings.
 */
export const saveTelegramSettings = async (settings: Omit<TelegramSettings, 'updatedAt'>) => {
   try {
      const settingsRef = doc(db, "settings", "telegram");
      await setDoc(settingsRef, {
         ...settings,
         updatedAt: new Date()
      });
      return { success: true };
   } catch (error) {
      console.error("Error saving Telegram settings:", error);
      throw error;
   }
};

/**
 * Fetches the Telegram settings.
 */
export const getTelegramSettings = async (): Promise<TelegramSettings | null> => {
   try {
      const settingsRef = doc(db, "settings", "telegram");
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
         const data = docSnap.data();
         return {
            ...data,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
         } as TelegramSettings;
      }
      return null;
   } catch (error) {
      console.error("Error fetching Telegram settings:", error);
      return null;
   }
};

/**
 * Fetches all sold ticket numbers for a specific lottery round.
 */
export const getSoldNumbers = async (lotteryId: string): Promise<number[]> => {
   try {
      const q = query(
         collection(db, "ticket_purchases"),
         where("lotteryId", "==", lotteryId)
      );

      const querySnapshot = await getDocs(q);
      const soldNumbers: number[] = [];

      querySnapshot.forEach((doc) => {
         const data = doc.data();
         // Filter out rejected orders on the client side to avoid needing a Firestore composite index
         if (data.status !== "rejected" && data.selectedNumbers && Array.isArray(data.selectedNumbers)) {
            soldNumbers.push(...data.selectedNumbers);
         }
      });

      return soldNumbers;
   } catch (error) {
      console.error("Error fetching sold numbers:", error);
      return [];
   }
};

/**
 * Checks if a phone number has already been used for a purchase in a specific lottery.
 */
export const checkPhoneUsed = async (lotteryId: string, phoneNumber: string): Promise<boolean> => {
   try {
      const q = query(
         collection(db, "ticket_purchases"),
         where("lotteryId", "==", lotteryId),
         where("phoneNumber", "==", phoneNumber)
      );

      const querySnapshot = await getDocs(q);
      // Filter out rejected orders on client side to avoid index
      const exists = querySnapshot.docs.some(doc => doc.data().status !== "rejected");
      return exists;
   } catch (error) {
      console.error("Error checking phone number:", error);
      return false;
   }
};

/**
 * Creates a new ticket purchase order in the pending state.
 */
export const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => {
   try {
      const orderRef = doc(collection(db, "ticket_purchases"));
      const newOrder: PurchaseOrder = {
         id: orderRef.id,
         ...orderData,
         status: "pending",
         createdAt: new Date(),
      };
      await setDoc(orderRef, newOrder);
      return { orderId: orderRef.id };
   } catch (error) {
      console.error("Error creating purchase order:", error);
      throw error;
   }
};

/**
 * Fetches all purchase orders from the ticket_purchases collection.
 */
export const getAllPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
   try {
      const ordersRef = collection(db, "ticket_purchases");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const orders: PurchaseOrder[] = [];

      querySnapshot.forEach((doc) => {
         const data = doc.data();
         orders.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : new Date())
         } as PurchaseOrder);
      });

      return orders;
   } catch (error) {
      console.error("Error fetching all purchase orders:", error);
      return [];
   }
};

/**
 * Fetches all purchase orders associated with a specific phone number.
 */
export const getPurchasesByPhone = async (phoneNumber: string): Promise<PurchaseOrder[]> => {
   try {
      const ordersRef = collection(db, "ticket_purchases");
      // Use a simple query to avoid requiring a composite index
      const q = query(ordersRef, where("phoneNumber", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      const orders: PurchaseOrder[] = [];

      querySnapshot.forEach((doc) => {
         const data = doc.data();
         orders.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : new Date())
         } as PurchaseOrder);
      });

      // Sort by date descending on the client side
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
   } catch (error) {
      console.error("Error fetching purchases by phone:", error);
      return [];
   }
};

/**
 * Updates the status of a purchase order.
 */
export const updatePurchaseStatus = async (orderId: string, status: 'approved' | 'rejected' | 'pending') => {
   try {
      const orderRef = doc(db, "ticket_purchases", orderId);
      await setDoc(orderRef, { status }, { merge: true });
      return { success: true };
   } catch (error) {
      console.error("Error updating purchase status:", error);
      throw error;
   }
};

/**
 * Deletes a purchase order from the collection.
 */
export const deletePurchaseOrder = async (orderId: string) => {
   try {
      const orderRef = doc(db, "ticket_purchases", orderId);
      await deleteDoc(orderRef);
      return { success: true };
   } catch (error) {
      console.error("Error deleting purchase order:", error);
      throw error;
   }
};
