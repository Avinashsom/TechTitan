'use client';

import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
  onScan: (code: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length > 0) {
          codeReader.decodeFromVideoDevice(
            videoInputDevices[0].deviceId,
            videoRef.current!,
            (result, err) => {
              if (result) {
                onScan(result.getText());
              }
            }
          );
        }
      })
      .catch(console.error);

    return () => {
      codeReader.reset();
    };
  }, [onScan]);

  return (
    <div className="mt-2 border rounded overflow-hidden">
      <video ref={videoRef} width="100%" height="240" />
    </div>
  );
}
