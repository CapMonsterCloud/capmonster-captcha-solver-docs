import React, { useEffect, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function RemotePrompt({ url, copyLabel, copiedLabel, loadingLabel, showLabel, hideLabel, errorLabel }) {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  const labels = {
    copy:
      copyLabel ??
      translate({
        id: 'remotePrompt.copyLabel',
        message: 'Скопировать prompt',
      }),

    copied:
      copiedLabel ??
      translate({
        id: 'remotePrompt.copiedLabel',
        message: 'Скопировано ✓',
      }),

    loading:
      loadingLabel ??
      translate({
        id: 'remotePrompt.loadingLabel',
        message: 'Загрузка...',
      }),

    show:
      showLabel ??
      translate({
        id: 'remotePrompt.showLabel',
        message: 'Показать prompt',
      }),

    hide:
      hideLabel ??
      translate({
        id: 'remotePrompt.hideLabel',
        message: 'Скрыть prompt',
      }),

    error:
      errorLabel ??
      translate({
        id: 'remotePrompt.errorLabel',
        message: 'Не удалось загрузить prompt.',
      }),
  };

  useEffect(() => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.text();
      })
      .then(setPrompt)
      .catch(() => setError(true));
  }, [url]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (error) {
    return <div className="alert alert--danger">{labels.error}</div>;
  }

  return (
    <div className={styles.remotePrompt}>
      <div className={styles.actions}>
        <button type="button" className={styles.copyButton} onClick={copyPrompt} disabled={!prompt}>
          {copied ? labels.copied : prompt ? labels.copy : labels.loading}
        </button>

        {prompt && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setExpanded(value => !value)}
            aria-expanded={expanded}
          >
            {expanded ? labels.hide : labels.show}
            <span className={styles.toggleIcon}>{expanded ? '▲' : '▼'}</span>
          </button>
        )}
      </div>

      {expanded && (
        <div className={styles.promptContent}>
          <CodeBlock language="text">{prompt}</CodeBlock>
        </div>
      )}
    </div>
  );
}
