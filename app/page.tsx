"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/navigation';
import '@aws-amplify/ui-react/styles.css'
import { usePlaidLink } from "react-plaid-link";
import React from "react";

Amplify.configure(outputs);

//const client = generateClient<Schema>();

export default function App() {
  /*
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
  */

  const router = useRouter(); // For navigation

  async function callPlaid() {
    try {
      console.log("icoico calling api");
      //const apiEndpoint = "http://127.0.0.1:3000/hello";
      const apiEndpoint = "http://127.0.0.1:3000/create-link-token";
      const response = await fetch(apiEndpoint, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Failed to fetch link token: ${response.statusText}`);
      }
      console.log("icoico: response = ", response);
      const data = await response.json();
      console.log("icoico: data = ", data);

      localStorage.setItem('accountBalance', JSON.stringify(data));
      console.log("icoico: accountBalance = ", localStorage.getItem('accountBalance'));

      router.push('/balance'); // Navigate to the balance page
    }
    catch (error) {
      console.error("Failed to fetch accountBalance:", error);
    }
  }


  // Plaid
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Fetch the link token from your Lambda backend
  useEffect(() => {
    let isMounted = true;
    const fetchLinkToken = async () => {
      try {
        const apiEndpoint = "http://127.0.0.1:3000/create-link-token"; // Replace with your actual API Gateway endpoint
        const response = await fetch(apiEndpoint, { method: "POST" });

        if (!response.ok) {
          throw new Error(`Failed to fetch link token: ${response.statusText}`);
        }

        const data = await response.json();
        if (isMounted) {
          setLinkToken(data.link_token); // Set the link_token for Plaid Link
        }
      } catch (error) {
        console.error("Error fetching link token:", error);
      }
    };

    fetchLinkToken();
    return () => {
      isMounted = false;
    }
  }, []);

  // Initialize Plaid Link with the link token
  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (publicToken, metadata) => {
      console.log("Public Token:", publicToken);
      console.log("Metadata:", metadata);

      // Send the public token to your Lambda backend to exchange for an access token
      try {
        const apiEndpoint = "http://127.0.0.1:3000/exchange-public-token";
        const response = await fetch(apiEndpoint, {
          method: "POST",
          //headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });

        if (!response.ok) {
          throw new Error(`Failed to exchange public token: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Access Token Response:", data);

        // Store access token or other data if needed
        localStorage.setItem("accountAccess", JSON.stringify(data));

      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    onExit: (error, metadata) => {
      if (error) {
        console.error("Plaid Link error:", error);
      }
      console.log("User exited Plaid Link:", metadata);
    },
  });

  async function getAccount() {
    try {
      console.log("icoico calling api");
      //const apiEndpoint = "http://127.0.0.1:3000/hello";
      const apiEndpoint = "http://127.0.0.1:3000/get-account";
      const response = await fetch(apiEndpoint, { method: 'GET' });
      console.log("icoico: response = ", response);

      const data = await response.json();
      console.log("icoico: data = ", data);

      localStorage.setItem('accountBalance', JSON.stringify(data));
      console.log("icoico: accountBalance = ", localStorage.getItem('accountBalance'));

      router.push('/balance'); // Navigate to the balance page
    }
    catch (error) {
      console.error("Failed to fetch accountBalance:", error);
    }
  }


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
            Username: {user?.signInDetails?.loginId || "No user information available"}
          </div>
          <br />
          <button onClick={() => open()} disabled={!ready}>
            Link with plaid
          </button>
          <div>
            🥳 Fetch your bank account with Plaid
          </div>

          <br />
          <button onClick={getAccount}>Get Account</button>
          {/*
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li onClick={() => deleteTodo(todo.id)}
                key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          */}
          <div>
            🥳 Link your bank account and analyze your debt status
          </div>
          <br />
          <br />
          <br />
          <button onClick={callPlaid}>Test Plaid</button>
          <br />
          <button onClick={signOut}>Sign out</button>
        </main>
      )
      }
    </Authenticator >
  );
}
