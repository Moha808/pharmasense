import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Camera, Barcode, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;
    setCameraError(null);
    setIsScanning(false);
    const scannerElementId = 'barcode-reader-viewport';

    const timer = setTimeout(() => {
      try {
        html5QrCode = new Html5Qrcode(scannerElementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        };

        html5QrCode
          .start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              toast.success(`Barcode Scanned: ${decodedText}`);
              onScanSuccess(decodedText);
              onClose();
            },
            () => {} // per-frame scan error — normal while searching
          )
          .then(() => {
            setIsScanning(true);
          })
          .catch((err) => {
            console.warn('Camera access unavailable:', err);
            setCameraError(
              'Camera access unavailable or permission denied. Please use manual entry below.'
            );
            setIsScanning(false);
          });
      } catch (e) {
        console.warn('Scanner init error:', e);
        setCameraError('Could not initialize camera scanner.');
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      const scanner = scannerRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => scanner.clear()).catch(() => {});
          } else {
            scanner.clear && scanner.clear();
          }
        } catch (_) {}
        scannerRef.current = null;
      }
      setIsScanning(false);
    };
  }, [isOpen, onScanSuccess, onClose]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('Please enter a barcode number');
      return;
    }
    onScanSuccess(manualCode.trim());
    setManualCode('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode Scanner & Camera Lookup"
      subtitle="Point camera at product barcode or type manual barcode digits"
      size="md"
    >
      <div className="space-y-4">
        {/* Camera Viewport Area */}
        <div className="relative overflow-hidden rounded-xl bg-black/90 aspect-video flex flex-col items-center justify-center border border-border">
          <div id="barcode-reader-viewport" className="w-full h-full" />
          
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface-alt/95 text-xs text-text-muted">
              <AlertCircle className="w-8 h-8 text-warning mb-2" />
              <p className="font-semibold text-text-main">{cameraError}</p>
              <p className="mt-1 text-[11px]">You can quickly type or paste the code in the manual field below.</p>
            </div>
          )}
        </div>

        {/* Manual Barcode Input Fallback */}
        <form onSubmit={handleManualSubmit} className="pt-3 border-t border-border">
          <label className="block text-xs font-bold text-text-main mb-1.5 flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-primary" /> Manual Barcode Entry
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. 8901234567890"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-border bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button variant="primary" size="md" type="submit">
              Find & Add
            </Button>
          </div>
        </form>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Scanner
          </Button>
        </div>
      </div>
    </Modal>
  );
}
