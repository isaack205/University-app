import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateContext = createContext(null);

export function UpdateProvider({ children }) {
    const [isCritical, setIsCritical] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [releaseNotes, setReleaseNotes] = useState(null);
    
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // Check for updates every hour in the background (optional but good practice)
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    // When an update is detected, fetch our config to see if it's critical, and fetch GitHub release notes
    useEffect(() => {
        if (needRefresh) {
            // Fetch local config for critical flag
            fetch('/update-config.json?' + new Date().getTime())
                .then(res => res.json())
                .then(data => {
                    if (data.critical) {
                        setIsCritical(true);
                        setDismissed(false); // Force it to show if previously dismissed
                    }
                })
                .catch(err => console.error('Failed to fetch update config', err));

            // Fetch latest release notes from GitHub
            fetch('https://api.github.com/repos/isaack205/University-app/releases/latest')
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`GitHub API error: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data && data.body) {
                        setReleaseNotes({
                            version: data.tag_name || 'Latest',
                            body: data.body,
                            url: data.html_url
                        });
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch github release notes (likely rate limit)', err);
                    // Fallback to sample data if rate limited so the UI can still be tested
                    setReleaseNotes({
                        version: 'v0.1.3 (Fallback)',
                        body: "### ✨ New Features\n- Implemented full **Progressive Web App** offline support.\n- Added secure **Admin Dashboard** analytics.\n\n### 🐛 Bug Fixes\n- Resolved UI glitch on mobile sidebars.\n- Fixed notification delivery delays.",
                        url: "https://github.com/isaack205/University-app"
                    });
                });
        }
    }, [needRefresh]);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
    }, []);

    const handleUpdate = useCallback(async () => {
        setIsUpdating(true);
        // The 4-5 second labor illusion
        setTimeout(async () => {
            if (updateServiceWorker) {
                await updateServiceWorker(true);
            }
            // Force reload just in case the SW doesn't automatically trigger it (especially in dev mode)
            window.location.reload();
        }, 4500);
    }, [updateServiceWorker]);

    // We only expose a "banner is visible" state, but also the raw needRefresh for nudges
    const bannerVisible = needRefresh && (!dismissed || isCritical);
    const nudgeVisible = needRefresh && dismissed && !isCritical;

    return (
        <UpdateContext.Provider value={{
            needRefresh,
            isCritical,
            bannerVisible,
            nudgeVisible,
            isUpdating,
            releaseNotes,
            handleDismiss,
            handleUpdate
        }}>
            {children}
        </UpdateContext.Provider>
    );
}

export function useUpdate() {
    return useContext(UpdateContext);
}
