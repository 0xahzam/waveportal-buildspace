import { useCallback, useEffect, useRef } from 'react'
import { ethers } from "ethers";
import abi from "./api/WavePortal.json";
import React, { useState } from "react";
import { Flex, Heading, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContract, useSigner } from "wagmi";
import { Input } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'

function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

import useToastHook from "./useToastHook";

const Home = () =>{
  const { isConnected } = useAccount();

  const contractABI = abi.abi;
  const contractAddress = "0x7eDd6Ae9e851FE91AeB1156896b18B4A358BD42c";

  const [state, newToast] = useToastHook();
  const { data: signer } = useSigner();


  const [allWaves, setAllWaves] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");

  const isMounted = useIsMounted()


  const checkIfWalletIsConnected = async () => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
        } else {
            console.log("No authorized account found");
        }
    } catch (error) {
        console.log(error);
    }
};



const wave = async (message) => {
  try {
      const { ethereum } = window;

      if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          /*
           * Execute the actual wave from your smart contract
           */
          const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
          console.log("Mining...", waveTxn.hash);
          newToast({ message: "Mining in progress", status: "success" });
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
          newToast({
            message: "Your wave is mined to the blockchain",
            status: "success",
          });
          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
      } else {
          console.log("Ethereum object doesn't exist!");
      }
  } catch (error) {
      console.log(error);
  }
};


const getAllWaves = async () => {
    const { ethereum } = window;

    try {
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            const waves = await wavePortalContract.getAllWaves();

            const wavesCleaned = waves.map((wave) => {
                return {
                    address: wave.waver,
                    timestamp: new Date(wave.timestamp * 1000),
                    message: wave.message,
                };
            });

            setAllWaves(wavesCleaned);
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log(error);
    }
};

useEffect(() => {
    checkIfWalletIsConnected();
}, []);

const [message, setMessage] = useState('');

    const handleChange = event => {
    setMessage(event.target.value);

    
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    useEffect(() => {
        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);
            setAllWaves((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, [])
  
  if (!isMounted) {
    return null
  }

  return (
      <div className ="main" style={{fontFamily:"Montserrat"}}>
       <Flex justifyContent={"space-between"} marginTop={"40px"} >
            <Flex paddingLeft={"22%"} color={"white"} fontSize={"30px"} fontWeight="700">WavePortal</Flex>
          <Flex  paddingRight={"22%"}>
            <ConnectButton/>
          </Flex>
      </Flex>
      <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} marginTop = {"100px"} >
        <Flex color={"white"} fontSize={"48px"} fontWeight={"700"}>GM👋 I&apos;m Ahzam</Flex>
        <Flex color={"white"} fontSize={"32px"} fontWeight="400px" opacity={"53%"}>build00r next door | smartcontracts x design</Flex>
        <Flex height = {"147px"} paddingTop={"39px"}>
          <Flex backgroundColor={"#1B1B1B"} rounded={"6px"} paddingTop={"5px"} width={"840px"} position={"relative"} >
          <Text color={"white"} opacity={"39%"} marginLeft={"28px"} marginRight={"28px"} marginTop={"12px"} fontWeight={"100"}>This dapp allows you to send me (the owner of this contract) a message while also waving at me, pretty cool right? this project is currently using goerli testnet so that you can wave at me without paying any real money :)
          </Text>
          </Flex>
        </Flex>

        {isConnected ? (
        <Flex paddingTop={"39px"} color="white">
          <Input
          className="inputbox"
          type="text"
          id="message"
          name="message"
          placeholder="what&apos;s up?"
          onChange={handleChange}
          value={message}
          width={"700px"}
      />

        <Button backgroundColor={"#7D57D2"} rounded={"6px"} paddingTop={"5px"} marginBottom={"5px"} width={"120px"}  marginLeft={"20px"} onClick={() => wave(message)}>
        <Flex color={"white"} fontSize={"17px"} fontWeight="600" marginBottom={"5px"}>send</Flex>
        </Button>
          
      </Flex>
        ):(
          <></>
        )}

      </Flex>
      </div>
        
  )
}

export default Home;