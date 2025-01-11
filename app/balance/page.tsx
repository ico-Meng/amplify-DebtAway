"use client";

import { useEffect, useState } from "react";

interface Account {
    account_id: string;
    balances: {
        available: number | null;
        current: number | null;
        limit: number | null;
        iso_currency_code: string | null;
        unofficial_currency_code: string | null;
    };
    mask: string;
    name: string;
    official_name: string | null;
    type: string;
    subtype: string;
    persistent_account_id: string;
}

interface AccountData {
    accounts: Account[];
}

interface ResponseData {
    account: AccountData;
}


export default function Balance() {
    const [balance, setBalance] = useState<AccountData | null>(null);

    useEffect(() => {
        console.log("icoico in balance")
        const data = localStorage.getItem('accountBalance');
        if (data) {
            const parsedData: ResponseData = JSON.parse(data);
            setBalance(parsedData.account);
            //setBalance(JSON.parse(data));
        }
    }, []);

    console.log("balance: ", balance)

    if (!balance || !balance.accounts) {
        return <p>Loading balance...</p>;
    }


    return (
        <div>
            <h1>Account Balance</h1>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "20px",
                }}
                border={1}
            >
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Official Name</th>
                        <th>Type</th>
                        <th>Subtype</th>
                        <th>Available Balance</th>
                        <th>Current Balance</th>
                        <th>Currency</th>
                    </tr>
                </thead>
                <tbody>
                    {balance.accounts.map((account) => (
                        <tr key={account.account_id}>
                            <td>{account.name}</td>
                            <td>{account.official_name || "N/A"}</td>
                            <td>{account.type}</td>
                            <td>{account.subtype}</td>
                            <td>{account.balances.available ?? "N/A"}</td>
                            <td>{account.balances.current ?? "N/A"}</td>
                            <td>{account.balances.iso_currency_code || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                onClick={() => {
                    window.location.href = "/"; // Adjust the URL as per your routing setup
                }}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "20px",
                    backgroundColor: "#333", // Black-grey color
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Back
            </button>
        </div>
    );
}