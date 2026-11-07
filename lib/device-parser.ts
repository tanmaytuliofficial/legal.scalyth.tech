import { DeviceInfo } from '@/types/legal';

export function parseUserAgent(uaString: string, clientHint?: Partial<DeviceInfo>): DeviceInfo {
  const ua = uaString || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  // Device detection
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // OS detection
  if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows NT 6.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/Windows NT 6.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows OS';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    if (/iPad|iPhone|iPod/.test(ua)) {
      os = 'iOS';
    } else {
      os = 'macOS';
    }
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  }

  // Browser detection
  if (/Edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([0-9.]+)/i);
    browser = `Microsoft Edge ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Chrome\//i.test(ua) && !/Chromium|OPR/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    browser = `Mozilla Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/Brave/i.test(ua)) {
    browser = 'Brave';
  }

  return {
    browser: clientHint?.browser || browser,
    os: clientHint?.os || os,
    deviceType: clientHint?.deviceType || deviceType,
    platform: clientHint?.platform || (deviceType === 'Mobile' ? 'Mobile Device' : 'Desktop Workstation'),
    screenResolution: clientHint?.screenResolution,
    userAgent: ua,
  };
}

export function extractClientIp(reqHeaders: Headers): string {
  const forwarded = reqHeaders.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp && firstIp !== '::1' && firstIp !== '127.0.0.1') {
      return firstIp;
    }
  }

  const realIp = reqHeaders.get('x-real-ip');
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') {
    return realIp;
  }

  const cfConnectingIp = reqHeaders.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return '127.0.0.1 (Localhost / Secure VPC)';
}
