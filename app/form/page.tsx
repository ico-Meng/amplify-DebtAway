"use client";

import { Button, View, Heading, Flex, TextField, ThemeProvider, Theme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { creditapi } from "@/app/components/link";
import { useRouter } from 'next/navigation';

export default function FormPage() {
    const router = useRouter();
    const handleSubmit = (event: {
        currentTarget: HTMLFormElement | undefined; preventDefault: () => void
    }) => {
        event.preventDefault();
        console.log("Form submitted");
    };

    return (
        <ThemeProvider>
            <View className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-800 to-purple-900">
                <View
                    className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
                    padding="2rem"
                >
                    <Heading level={2} marginBottom="1rem">
                        Preprare for Debt Analysis
                    </Heading>
                    <br />
                    <br />
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="1rem">
                            <Flex gap="1rem" justifyContent="space-between">
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    placeholder="Enter your first name"
                                    required
                                    width="48%" // Adjust width to make it fit in one row
                                    style={{
                                        borderWidth: "2px",
                                        borderColor: "#444444",
                                    }}
                                />
                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Enter your last name"
                                    required
                                    width="48%" // Adjust width to make it fit in one row
                                    style={{
                                        borderWidth: "2px",
                                        borderColor: "#444444",
                                    }}
                                />
                            </Flex>
                            <TextField
                                label="Home Address"
                                name="homeAddressline1"
                                placeholder="Enter your home address line 1"
                                required
                                style={{
                                    borderWidth: "2px",
                                    borderColor: "#444444",
                                }}
                            />
                            <TextField
                                label=""
                                name="homeAddressline2"
                                placeholder="Enter your home address line 2(Optional)"
                                style={{
                                    borderWidth: "2px",
                                    borderColor: "#444444",
                                }}
                            />
                            <Flex gap="1rem" justifyContent="space-between">
                                <TextField
                                    label="City"
                                    name="city"
                                    placeholder="Enter your city name"
                                    required
                                    width="48%" // Adjust width to make it fit in one row
                                    style={{
                                        borderWidth: "2px",
                                        borderColor: "#444444",
                                    }}
                                />
                                <TextField
                                    width="48%" // Set custom width for Zip Code
                                    label="Zip Code"
                                    name="zipCode"
                                    placeholder="Enter your zip code"
                                    required
                                    style={{
                                        borderWidth: "2px",
                                        borderColor: "#444444",
                                    }}
                                />
                            </Flex>
                            <TextField
                                width="53%"
                                label="SSN"
                                name="ssn"
                                placeholder="Enter your SSN"
                                type="password"
                                required
                                style={{
                                    borderWidth: "2px",
                                    borderColor: "#444444",
                                }}
                            />
                            <Flex justifyContent="flex-start" style={{ marginTop: "20px" }}>
                                <Button
                                    onClick={() => {
                                        window.location.href = "/"; // Adjust the URL as per your routing setup
                                    }}
                                    variation="primary" // Correct prop for Amplify Button
                                    style={{
                                        position: "fixed",
                                        bottom: "20px",
                                        left: "20px",
                                        backgroundColor: "#333",
                                        color: "#fff",
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => creditapi({ router })}
                                    variation="primary" // Correct prop for Amplify Button
                                    style={{
                                        position: "fixed",
                                        bottom: "20px",
                                        right: "20px",
                                        backgroundColor: "#333",
                                        color: "#fff",
                                    }}
                                >
                                    Pull Debt
                                </Button>
                            </Flex>
                        </Flex>
                    </form>
                </View>
            </View>
        </ThemeProvider>
    );
}