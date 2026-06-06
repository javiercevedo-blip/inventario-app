import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw } from 'lucide-react';

const Scanner = ({ onScanResult, onClose }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const qrRef = useRef(null);
  const scannerInstance = useRef(null);

  // Initialize and list cameras
  useEffect(() => {
    // Make sure we have permissions and list cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('trasera') ||
            device.label.toLowerCase().includes('environment')
          );
          const chosenCamera = backCamera || devices[0];
          setCurrentCameraId(chosenCamera.id);
        } else {
          setErrorMsg('No se detectaron cámaras en este dispositivo.');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setErrorMsg('Permiso de cámara denegado o no disponible.');
      });

    return () => {
      // Cleanup: stop scanner on unmount
      stopScanning();
    };
  }, []);

  // Trigger scanning when currentCameraId changes or is set
  useEffect(() => {
    if (currentCameraId && !isScanning) {
      startScanning(currentCameraId);
    }
  }, [currentCameraId]);

  const startScanning = async (cameraId) => {
    try {
      if (scannerInstance.current) {
        await stopScanning();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerInstance.current = html5QrCode;

      setIsScanning(true);
      setErrorMsg('');

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: (width, height) => {
            // Responsive box
            const minSize = Math.min(width, height);
            const boxSize = Math.floor(minSize * 0.7);
            return { width: boxSize, height: boxSize };
          }
        },
        (decodedText) => {
          // Success callback
          onScanResult(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Silent failure callback for scanning frames
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setErrorMsg('Error al iniciar la transmisión de la cámara.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerInstance.current && scannerInstance.current.isScanning) {
      try {
        await scannerInstance.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const toggleCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-wrapper" style={{ maxWidth: '400px' }}>
        <div className="modal-header-row">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="var(--primary)" /> Escáner de Código
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-content">
          {errorMsg ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '1rem' }}>{errorMsg}</p>
              <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <>
              <div className="scanner-viewport">
                <div id="qr-reader-container" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></div>
                {isScanning && <div className="scanner-laser"></div>}
              </div>

              <p className="scanner-hint">
                Apunta tu cámara hacia el código de barras o código QR.
              </p>

              {cameras.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                  <button className="btn btn-secondary" onClick={toggleCamera}>
                    <RefreshCw size={16} /> Cambiar Cámara ({cameras.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
