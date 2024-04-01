import { useEffect, useState, useCallback } from "react";
import { ethers, Signer } from "ethers";
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract } from 'ethers'
import PokemoonABI from "../contracts/PokemoonABI.json";
import styles from "@/styles/Home.module.css";

import UniswapButton from './UniswapButton'
import { sendGAEvent } from '@next/third-parties/google'

interface NftData {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  timeUntilNextEvolution: number;
}

const contractAddress = "0x32fBCC32CcB5D03633158beb5047fF476e9cC4aD";


function NftRender() {
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [nftMetadataList, setNftMetadataList] = useState<NftData[]>([]);
  const [signer, setSigner] = useState<Signer | null>(null);
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    async function initializeSigner() {

      if (isConnected && chainId === 1 && walletProvider) {
        try {
          const ethersProvider = new BrowserProvider(walletProvider);
          const signer = await ethersProvider.getSigner();
          setSigner(signer);
          isConnected;
        } catch (error) {
          console.error("Error connecting wallet:", error);
          !isConnected;
        }
      }
    }

    initializeSigner();
  }, [isConnected, chainId, walletProvider]);


  const fetchData = useCallback(async () => {
    if (signer && chainId === 1) {
      const contract = new Contract(contractAddress, PokemoonABI, signer);
      try {
        const ownedTokens = await contract.owned(address);
        setTokenIds(ownedTokens);
  
        const metadataPromises = ownedTokens.map(async (tokenId: number) => {
          try {
            const tokenURI = await contract.tokenURI(tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();
  
            const timeUntilNextEvolution = await contract.getTimeUntilNextEvolution(tokenId);
  
            const updatedMetadata: NftData = {
              tokenId,
              timeUntilNextEvolution,
              ...metadata
            };
  
            return updatedMetadata;
          } catch (error) {
            console.error("Error fetching token metadata:", error);
            return null;
          }
        });
  
        const nftMetadataList = await Promise.all(metadataPromises);
        const filteredMetadataList = nftMetadataList.filter((metadata) => metadata !== null);
        setNftMetadataList(filteredMetadataList);
      } catch (error) {
        console.error("Error fetching data from contract:", error);
      }
    }
  }, [signer, address, chainId]);

  
  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected, fetchData]);


  const handlePauseEvolution = async (tokenId: number) => {
    try {
      const contract = new Contract(contractAddress, PokemoonABI, signer!);
      const tx = await contract.setPauseEvolution(tokenId);
      await tx.wait();
      console.log(`Successfully paused evolution for token ID: ${tokenId}`);
      fetchData(); 
    } catch (error) {
      console.error("Error pausing evolution:", error);
    }
  };
  
  const handleContinueEvolution = async (tokenId: number) => {
    try {
      const contract = new Contract(contractAddress, PokemoonABI, signer!);
      const tx = await contract.setContinueEvolution(tokenId);
      await tx.wait();
      console.log(`Successfully continued evolution for token ID: ${tokenId}`);
      fetchData();
    } catch (error) {
      console.error("Error continuing evolution:", error);
    }
  };

  const renderNFTs = () => {
    if (!isConnected && chainId !== 1) {
      return (
        <div className={styles.notwallet}>
          <p className={styles.notWalletP}>Connect your wallet to view NFTs</p>
          <UniswapButton />
        </div>
      );
    } else if (nftMetadataList.length === 0) {
      return (
        <div className={styles.notwallet}>
          <p className={styles.notWalletP}>No NFTs found in your wallet</p>
          <UniswapButton />
        </div>
      )
    } else {
    return nftMetadataList.map((metadata, index) => {
      let pauseButton = null;
      let continueButton = null;
      const timeUntilNextEvolution = metadata.timeUntilNextEvolution;

      if (metadata.timeUntilNextEvolution >= 0 && metadata.timeUntilNextEvolution <= 7) {
        pauseButton = (
          <button
            className={styles.buttonPause}
            onClick={() => {
              handlePauseEvolution(metadata.tokenId);
              sendGAEvent({ event: 'buttonClicked', value: 'PauseEvolution' });
            }}>
            Pause Evolution
          </button>
          );
      }
  
      if (metadata.timeUntilNextEvolution == 11) {
        continueButton = (
          <button 
          className={styles.buttonContinue}
          onClick={() => {
            handleContinueEvolution(metadata.tokenId);
            sendGAEvent({ event: 'buttonClicked', value: 'ContinueEvolution' });
          }}>
          Continue Evolution
          </button>
        );
      }
      const tokenId = metadata.tokenId.toString();

      return (
        <div key={index} className={styles.nftCard}>
          <div className={styles.imgNFT}>
            <img src={metadata.image} alt={metadata.name} />
          </div>
          <div className={styles.nameNFT}>
          <div className={styles.nameButton}>
            <h1 className={styles.nftH1}>{metadata.name} <span className={styles.tokenId}>#{tokenId}</span></h1>
            {pauseButton}
            {continueButton}
          </div>
          {timeUntilNextEvolution >= 0 && timeUntilNextEvolution <= 7 &&
                <div className={styles.timeToEvolution}>Until the Next Evolution: {timeUntilNextEvolution.toString()} days</div>
              }
          <div className={styles.descriptNFT}>
            <p>{metadata.description}</p>
          </div>
          
          <div className={styles.attributes}>
          {metadata.attributes.map((attribute, attrIndex) => (
            <div key={attrIndex} className={styles.attribNFT}>
              <p className={styles.traitNFT}>{attribute.trait_type}</p>
              <p className={styles.valueNFT}>{attribute.value}</p>
            </div>
          ))}
          </div>
          </div>
        </div>
      );
    });
    };
  };
 
  return (
    <div className={styles.nftContainer}>
      {renderNFTs()}
    </div>
  );

};

export default NftRender;