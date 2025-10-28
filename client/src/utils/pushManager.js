import { notificationService } from "@/services/notificationService";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Converts Base64 VAPID key to a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export const pushManager = {
  // Request permission and subscribe user
  async subscribeUser() {
    try {
      if (!("serviceWorker" in navigator) || !('PushManager' in window)) {
        console.warn("Service workers not supported in this browser.");
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied.");
        return null;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await notificationService.saveSubscription(subscription);
            return subscription;
        }

        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
        });

        console.log('FRONTEND: Subscription successful! Object:', subscription);

        console.log('User subscribed:', subscription);

        await notificationService.saveSubscription(subscription.toJSON());
        console.log('Subscription saved to backend successfully.');
        
        return subscription;
    } catch (err) {
      console.error("❌ Push subscription failed:", err.message);
      throw err;
    }
  },

  // Unsubscribe user
  async unsubscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log("🧹 User unsubscribed from push notifications.");
      }
    } catch (err) {
      console.error("Failed to unsubscribe:", err.message);
    }
  },

  // Check if user is already subscribed
  async isUserSubscribedToPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  },
};
