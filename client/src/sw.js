// Required for Workbox to function correctly
import { precacheAndRoute } from 'workbox-precaching';

// Replace with the generated assets list
precacheAndRoute(self.__WB_MANIFEST);

self.__WB_MANIFEST

// 1. Listen for the 'push' event
self.addEventListener('push', (event) => {
    console.log('SW: PUSH EVENT RECEIVED. Attempting simple popup.');

    const data = event.data ? event.data.json() : {};
    
    // Fallback/Default notification details
    const title = data.title || 'Campus Hub Notification';
    const body = data.body || 'You have a new update.';
    const icon = '/icons/maskable_icon_x192.png';
    const tag = data.type || 'generic-notification';

    const options = {
        body: body,
        icon: icon,
        badge: '/icons/maskable_icon_x192.png',
        vibrate: [100, 50, 100], // Vibration pattern
        data: {
            url: '/notifications', 
            type: data.type
        },
        tag: tag,
    };

    // Keep the service worker alive until the notification is displayed
    event.waitUntil(
        self.registration.showNotification(title, options)
        .catch(e => {
            console.error('SW: showNotification failed! Check icon/badge paths or payload parsing.', e);
            return self.registration.showNotification('Backup Alert', { body: 'Rich notification failed to display.' });
        })
    );
});

// 2. Listen for the 'notificationclick' event
self.addEventListener('notificationclick', (event) => {
    const clickedNotification = event.notification;
    clickedNotification.close();

    const targetUrl = clickedNotification.data.url || '/';

    // Open the app or focus on the correct window/tab
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Check if a client window is already open
            for (const client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});