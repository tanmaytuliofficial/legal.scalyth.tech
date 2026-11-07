import { DeviceInfo } from '@/types/legal';

export function getClientDeviceHints(): Partial<DeviceInfo> {
  if (typeof window === 'undefined') return {};

  const width = window.screen?.width || 0;
  const height = window.screen?.height || 0;
  const screenResolution = width && height ? `${width}x${height}` : undefined;

  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  const ua = navigator.userAgent;

  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua) || (width && width < 768)) {
    deviceType = 'Mobile';
  }

  return {
    screenResolution,
    deviceType,
    platform: navigator.platform || 'Workstation',
  };
}
