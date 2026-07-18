export const triggerHaptic = (type: 'low-battery' | 'proximity' | 'success') => {
  if (!('vibrate' in navigator)) {
    console.warn("Haptic feedback not supported on this device.");
    return;
  }

  switch (type) {
    case 'low-battery':
      // Three long vibrations for low battery warning
      navigator.vibrate([500, 200, 500, 200, 500]);
      break;
    case 'proximity':
      // Two short, urgent vibrations for proximity warning
      navigator.vibrate([150, 100, 150]);
      break;
    case 'success':
      // Single short vibration for success
      navigator.vibrate([100]);
      break;
    default:
      navigator.vibrate([200]);
  }
};
