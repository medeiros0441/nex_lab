import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

type Props = {
  value: string;
  size?: number;
};

export default function QrCodeUniversal({ value, size = 120 }: Props) {
  const [QRCodeComponent, setQRCodeComponent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (Platform.OS === 'web') {
        // @ts-ignore
        const qr: any = await import('qrcode.react');
        const QRCode = qr.QRCodeCanvas || qr.QRCodeSVG || qr.default;
        if (isMounted) setQRCodeComponent(() => QRCode);
      } else {
        // @ts-ignore
        const { default: QRCode } = await import('react-native-qrcode-svg');
        if (isMounted) setQRCodeComponent(() => QRCode);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  if (!QRCodeComponent) return null;
  return <QRCodeComponent value={value} size={size} />;
}
