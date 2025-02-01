"use client";

import "./../app/app.css";
import '@aws-amplify/ui-react/styles.css'
import React from "react";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react'
import {
  UserProfile,
  PlaidIntegration,
  getAccount,
  testapi,
  testicoicoapi
} from "@/app/components/link";

import Image from "next/image";

Amplify.configure(outputs);


export default function App() {
  const [prodEnv, setProdEnv] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [openPlaidLink, setOpenPlaidLink] = useState<(() => void) | null>(null);
  const [isPlaidReady, setIsPlaidReady] = useState(false);

  const router = useRouter();

  const handlePlaidOpen = React.useCallback((open: () => void, ready: boolean) => {
    setOpenPlaidLink(() => open);
    setIsPlaidReady(ready);
  }, []);

  const handleTestApi = React.useCallback(() => {
    testapi({ clientId, linkToken, publicToken });
  }, [clientId, linkToken, publicToken]);

  const handleGetAccount = React.useCallback(() => {
    getAccount({ clientId, linkToken, router });
  }, [clientId, linkToken]);

  const handleDebtFormRedirect = () => {
    router.push("/form");
  };



  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1 style={{ textAlign: 'center' }}>Debt Away</h1>
          <div
            style={{
              fontSize: "1.5em", // Make it bigger
              color: "#000000", // Sea color (Sea Green)
            }}
          >
            <UserProfile
              userId={userId}
              setUserId={setUserId}
            />
          </div>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png"
            alt="Picture of the bitcoin"
            width={50}
            height={50}
          />
          <br />
          <div>
            <PlaidIntegration
              userId={userId}
              setUserId={setUserId}
              clientId={clientId}
              setClientId={setClientId}
              linkToken={linkToken}
              setLinkToken={setLinkToken}
              publicToken={publicToken}
              setPublicToken={setPublicToken}
              onOpen={handlePlaidOpen}
            />
            <button onClick={() => openPlaidLink && openPlaidLink()} disabled={!isPlaidReady}>
              Link with Plaid
            </button>
          </div>
          <div>
            🥳 Fetch your bank account with Plaid
          </div>
          <br />
          <button
            onClick={handleDebtFormRedirect}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none" >
            Debt Analysis
          </button>

          <br />
          <button onClick={handleGetAccount}>Bank Account</button>

          <br />
          <br />
          <br />
          <button onClick={() => testicoicoapi()}>Test</button>
          <br />
          <br />
          <button onClick={signOut}>Sign out</button>



        </main>
      )
      }
    </Authenticator >
  );
}
