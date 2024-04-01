import React from 'react';
import styles from './UniswapButton.module.css';
import UniswapIcon from './UniswapIcon'; 
import { sendGAEvent } from '@next/third-parties/google'

const UniswapButton: React.FC = () => {
  const handleGoToUniswap = () => {
    window.open('https://uniswap.org', '_blank');
  };

  return (
    <button className={styles.uniswapButton}   onClick={() => {
      handleGoToUniswap();
      sendGAEvent({ event: 'buttonClicked', value: 'Uniswap' });
    }}>
      Buy on Uniswap
     <UniswapIcon className={styles.uniswapIcon} />
    </button>
  );
};

export default UniswapButton;
