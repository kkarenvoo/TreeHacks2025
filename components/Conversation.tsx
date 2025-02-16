"use client";

import { useConversation } from "@11labs/react";
import { StreamingQuerystring } from "formidable/parsers";
import { useCallback } from "react";

export function Conversation({ setQuestion, code }: any) {
  console.log("hellooooooo")
  console.log("from conversation", String(code));
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  let conversationId : string = '';
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      conversationId = await conversation.startSession({
        agentId: "9208b8cOTlcDHRt2ydRE", // Replace with your agent ID
        clientTools: {
          getUserResponse: async () => {
            console.log("CODE", code);
            return code;
          },
          sendNewQuestion: async ({ question }) => {
            setQuestion(question);
          },
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  function sleep(ms: Number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let agent_feedback : string = "";
  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    console.log("CONVO ID:", conversationId)
    const url = 'https://api.elevenlabs.io/v1/convai/conversations/' + 'knr1r6Wo9nguGRsC1Bkg';

    await sleep(120000);
    const options = {method: 'GET', headers: {'xi-api-key': 'sk_40e013042bdf2b24be6ffdd38ab707a63fdd8042195d5b38'}};

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      agent_feedback = data['analysis']['evaluation_criteria_results']['quality_of_verbal_explanation']['rationale'];
    } catch (error) {
      console.error(error);
    }
    
  }, [conversation]);

  return (
    <div className="flex flex-col z-50 items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === "connected"}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== "connected"}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      {/* <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
      </div> */}
    </div>
  );
}
