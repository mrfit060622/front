import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  return (
    showBanner && (
      <Modal show={showBanner} onHide={handleRejectCookies} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Uso de Cookies</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Este site utiliza cookies para melhorar a experiência do usuário. Ao continuar, você concorda com o uso de cookies.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRejectCookies}>
            Recusar
          </Button>
          <Button variant="primary" onClick={handleAcceptCookies}>
            Aceitar
          </Button>
        </Modal.Footer>
      </Modal>
    )
  );
}

export default CookieConsent;
