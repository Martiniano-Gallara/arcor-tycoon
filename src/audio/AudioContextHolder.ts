/**
 * AudioContextHolder: Centraliza la instancia única de AudioContext para todo el juego,
 * evitando el límite de contextos del navegador, fugas de memoria y bloqueos de Autoplay.
 */

let sharedAudioContext: AudioContext | null = null;
let userHasInteracted = false;

if (typeof window !== 'undefined') {
  const onUserGesture = () => {
    userHasInteracted = true;
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', onUserGesture);
    window.removeEventListener('keydown', onUserGesture);
    window.removeEventListener('touchstart', onUserGesture);
  };

  window.addEventListener('pointerdown', onUserGesture, { passive: true });
  window.addEventListener('keydown', onUserGesture, { passive: true });
  window.addEventListener('touchstart', onUserGesture, { passive: true });
}

export function hasUserInteracted(): boolean {
  return userHasInteracted;
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioContext = new AudioCtxClass();
    }
  }

  if (sharedAudioContext && sharedAudioContext.state === 'suspended' && userHasInteracted) {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}
