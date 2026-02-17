/**
 * useModal - Reusable hook for modal behavior
 */

import { useEffect, useCallback } from 'react';

interface UseModalOptions {
  onClose: () => void;
  closeOnEscape?: boolean;
  preventBackgroundScroll?: boolean;
}

export function useModal({
  onClose,
  closeOnEscape = true,
  preventBackgroundScroll = true,
}: UseModalOptions) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, closeOnEscape]);

  // Prevent background scroll
  useEffect(() => {
    if (!preventBackgroundScroll) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [preventBackgroundScroll]);

  // Handle background click
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return { handleBackgroundClick };
}
