'use client'
import Image from "next/image";
import Head from "next/head";
import { useState } from "react";
import NftRender from '../components/NftRender';
import React from 'react';
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

  const closeAll = () => {
    setIsConnectHighlighted(false);
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header>
        <div className={styles.backdrop} style={{ opacity: isConnectHighlighted ? 1 : 0 }} />
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/pokeball.webp" alt="WalletConnect Logo" height="48" width="48" />
          </div>
          <div className={styles.buttons}>
            <div onClick={closeAll} className={`${styles.highlight} ${isConnectHighlighted ? styles.highlightSelected : ``}`}>
              <w3m-button />
            </div>
          </div>
        </div>
      </header>
    <main className={styles.main}>
      <div>
      <NftRender />
      </div>
    </main>
    </>
  );
}
