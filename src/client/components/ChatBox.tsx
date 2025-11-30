import React, { useState, useRef, useEffect } from "react";
import type { Message } from "../types";
import { sendChatMessage, ChatApiError } from "../api/chat";
import "./ChatBox.css";

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Send to API
      const response = await sendChatMessage(messages, userMessage.content);

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      let errorMessage = "Failed to get response. Please try again.";

      if (err instanceof ChatApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Remove the last user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h2>AI Chat Assistant</h2>
        <p className="chat-subtitle">Powered by Ollama</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Start a conversation by typing a message below.</p>
            <p className="empty-state-note">
              The assistant can only answer based on its configured knowledge.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message message-${message.role}`}>
            <div className="message-header">
              <span className="message-role">
                {message.role === "user" ? "You" : "Assistant"}
              </span>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant loading">
            <div className="message-header">
              <span className="message-role">Assistant</span>
            </div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
          disabled={isLoading}
          rows={3}
        />
        <button
          className="chat-send-button"
          onClick={() => void handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
