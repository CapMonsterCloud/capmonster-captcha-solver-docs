'use client';

import React, { useState, useEffect } from 'react';
import SubMenuWrap from './SubMenuWrap';
import { HeaderMenuSubItem } from './types';
import SubMenuItem from './SubMenuItem';
import ArrowIcon from '@site/static/img/arrow.svg';
import styles from './SubMenu.module.css';

type SubMenuProps = {
  link: HeaderMenuSubItem;
  handleClick?: () => void;
};

const SubMenu = ({ link, handleClick }: SubMenuProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 996);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleClickToggle = () => {
    if (isMobile) setIsVisible(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isMobile && e.key === 'Enter') setIsVisible(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsVisible(false);
  };

  return (
    <div className={styles.subMenu} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        tabIndex={0}
        onClick={handleClickToggle}
        onKeyDown={handleKeyDown}
        className={styles.button}
      >
        <span className={styles.buttonTitle}>{link.title}</span>
        <ArrowIcon className={styles.arrow} />
      </button>

      <SubMenuWrap isVisible={isVisible} isTwoColumn={link.isTwoColumn}>
        {link.subItems.map(subLink => (
          <SubMenuItem
            key={subLink.gtmId}
            icon={subLink.icon}
            title={subLink.title}
            href={subLink.url}
            gtmId={subLink.gtmId}
            handleClick={handleClick}
          />
        ))}
      </SubMenuWrap>
    </div>
  );
};

export default SubMenu;
