/**
 * Service Worker Registration - Registers the PWA service worker
 */

// Type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Navigator for iOS standalone
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[PWA] Error during registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      // No internet connection - running in offline mode
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[PWA] Error unregistering:', error);
      });
  }
}

// Hook to check if app is installed
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

// Store for the deferred install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function getInstallPrompt(): Promise<BeforeInstallPromptEvent | null> {
  return new Promise((resolve) => {
    if (deferredPrompt) {
      resolve(deferredPrompt);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      resolve(deferredPrompt);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Timeout after 30 seconds if no prompt
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(null);
    }, 30000);
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    deferredPrompt = null;
    return true;
  }

  return false;
}

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

// Listen for successful install
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
});
