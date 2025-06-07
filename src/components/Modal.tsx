import React from 'react';
import modalStyles from '../styles/components/Modal.module.css';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={modalStyles.closeButton} onClick={onClose}>
          &times; {/* Symbol "x" to close */}
        </button>
        {title && <h3 className={modalStyles.modalTitle}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Modal;