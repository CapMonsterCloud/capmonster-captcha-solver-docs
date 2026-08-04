import React from 'react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import getLocaleStrings from '../../locales/index';

type Props = {
  isOpen: boolean;
  responseId?: string | null;
  onClose: () => void;
  onSubmit?: (payload: { responseId?: string | null; comment: string }) => Promise<void> | void;
};

const FeedbackModal: React.FC<Props> = ({ isOpen, responseId, onClose, onSubmit }) => {
  const [comment, setComment] = React.useState('');
  const { i18n } = useDocusaurusContext();
  const t = getLocaleStrings(i18n?.currentLocale);

  React.useEffect(() => {
    if (isOpen) setComment('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async () => {
    try {
      if (onSubmit) {
        await onSubmit({ responseId, comment });
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.title}>{t.feedbackModalTitle}</div>
          <button aria-label={t.close || 'close'} className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.2929 0.292894C14.6835 -0.0976309 15.3165 -0.0976312 15.707 0.292894C16.0974 0.683431 16.0975 1.31648 15.707 1.70696L9.41401 7.99994L15.707 14.2929C16.0974 14.6835 16.0975 15.3165 15.707 15.707C15.3165 16.0975 14.6835 16.0974 14.2929 15.707L7.99994 9.41401L1.70696 15.707C1.31649 16.0975 0.683431 16.0974 0.292894 15.707C-0.097631 15.3165 -0.0976309 14.6835 0.292894 14.2929L6.58588 7.99994L0.292894 1.70696C-0.0976313 1.31643 -0.0976313 0.683419 0.292894 0.292894C0.683419 -0.0976313 1.31643 -0.0976313 1.70696 0.292894L7.99994 6.58588L14.2929 0.292894Z" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>
          <textarea
            className={styles.textarea}
            placeholder={t.feedbackModalPlaceholder}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t.cancel}
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!comment.trim()}>
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
