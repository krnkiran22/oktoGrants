"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoginButton } from "@/app/components/LoginButton";
import GetButton from "@/app/components/GetButton";
import {
  getAccount,
  getPortfolioNFT,
  useOkto,
  getPortfolioActivity,
  UserNFTBalance, // Import the missing type
} from "@okto_web3/react-sdk";

export default function Home() {
  const { data: session } = useSession();
  const oktoClient = useOkto();

  //@ts-ignore
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);

  const [portfolio, setPortfolio] = useState<UserNFTBalance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAuthenticate() {
    if (!idToken) {
      return { result: false, error: "No google login" };
    }
    try {
      const user = await oktoClient.loginUsingOAuth({
        idToken: idToken,
        provider: "google",
      });
      console.log("Authentication Success", user);
      return user;
    } catch (error) {
      console.error("Authentication Error:", error);
      return { result: false, error: (error as Error).message };
    }
  }

  async function handleLogout() {
    try {
      signOut();
      return { result: "logout success" };
    } catch (error) {
      return { result: "logout failed" };
    }
  }

  async function handleGetAccount() {
    return getAccount(oktoClient);
  }

  async function handleGetNFTs() {
    try {
      const nfts = await getPortfolioNFT(oktoClient);
      setPortfolio(nfts);
      return nfts;
    } catch (error) {
      setError((error as Error).message);
      return { error: (error as Error).message };
    }
  }

  async function handleGetActivity() {
    try {
      const activities = await getPortfolioActivity(oktoClient);
      return activities;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  useEffect(() => {
    if (idToken) {
      handleAuthenticate();
    }
  }, [idToken]);

  return (
    <main className="flex min-h-screen flex-col items-center space-y-6 p-12 bg-violet-200">
      <div className="text-black font-bold text-3xl mb-8">Template App</div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
        <LoginButton />
        <GetButton title="Okto Log out" apiFn={handleLogout} />
        <GetButton title="Get Account" apiFn={handleGetAccount} />
        <GetButton title="Get NFTs" apiFn={handleGetNFTs} />
        <GetButton title="Get Activities" apiFn={handleGetActivity} />
      </div>

      {portfolio && (
        <div className="mt-4 bg-white p-4 rounded-lg max-h-96 overflow-y-auto w-full max-w-lg">
          <h3 className="font-bold">Your NFT Portfolio</h3>
          <pre className="text-xs">{JSON.stringify(portfolio, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500 bg-white p-2 rounded-lg w-full max-w-lg">
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}
