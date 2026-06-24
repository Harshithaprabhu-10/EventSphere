import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkInAttendee } from '../api/registrationApi';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

function CheckIn() {
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');

  const scannerRef = useRef(null);

  // Clean up the camera stream when the component unmounts or scanning stops,
  // so we don't leave the user's camera running in the background.
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleCheckIn = async (token) => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await checkInAttendee(token.trim());
      setResult(data);
      setQrToken('');
    } catch (err) {
      const message = err.response?.data?.message || 'Check-in failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleCheckIn(qrToken);
  };

  const startScanning = async () => {
    setScannerError('');
    setScanning(true);

    // Wait a tick so the scanner's target <div> exists in the DOM before we attach to it.
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // prefer the rear camera on phones
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // A QR code was successfully scanned — stop the camera and check in immediately.
            scanner.stop().catch(() => {});
            setScanning(false);
            handleCheckIn(decodedText);
          },
          () => {
            // Called continuously while no QR code is in frame — intentionally ignored,
            // this is not an error, just "still looking."
          }
        );
      } catch (err) {
        setScannerError(
          'Could not access camera. Check browser permissions, or use manual entry below.'
        );
        setScanning(false);
      }
    }, 100);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  return (
    <div className="page">
      <div className="form-card">
        <div className="checkin-icon-badge">📷</div>
        <div className="page-header">
          <h2>Check in attendee</h2>
          <p>Scan the attendee's QR code with your camera, or enter their token manually.</p>
        </div>

        {!scanning && (
          <button type="button" className="btn-block" onClick={startScanning} style={{ marginBottom: 16 }}>
            Start camera scanner
          </button>
        )}

        {scanning && (
          <div style={{ marginBottom: 16 }}>
            <div id={SCANNER_ELEMENT_ID} style={{ borderRadius: 12, overflow: 'hidden' }} />
            <button type="button" className="btn-secondary btn-block" onClick={stopScanning} style={{ marginTop: 10 }}>
              Stop scanning
            </button>
          </div>
        )}

        {scannerError && (
          <div className="alert alert-error">
            <p>{scannerError}</p>
          </div>
        )}

        <div className="field-hint" style={{ marginTop: scanning ? 0 : 4, marginBottom: 10 }}>
          Or enter the token manually:
        </div>

        <form onSubmit={handleManualSubmit}>
          <div className="form-field">
            <label>QR token</label>
            <input
              type="text"
              className="checkin-token-input"
              placeholder="Paste or type token here"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-block" disabled={loading}>
            {loading ? 'Checking in...' : 'Check in'}
          </button>
        </form>

        {result && (
          <div className="checkin-result-card success">
            <span className="checkin-result-icon">✅</span>
            <div>
              <div className="checkin-result-title">Check-in successful</div>
              <div className="checkin-result-detail">Event: {result.event}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="checkin-result-card error">
            <span className="checkin-result-icon">⚠️</span>
            <div>
              <div className="checkin-result-title">Check-in failed</div>
              <div className="checkin-result-detail">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;