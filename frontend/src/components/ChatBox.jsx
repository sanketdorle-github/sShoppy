import React, { useState, useRef, useEffect } from "react";
import {
  FaCommentDots,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaRobot,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help you with any questions about our products, shipping, returns, or anything else! Ask me anything!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Auto scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target) &&
        !event.target.closest(".chat-toggle-btn")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Call API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const result = await response.json();

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);

        if (result.success) {
          const botMessage = {
            id: messages.length + 2,
            text: result.reply,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          const errorMessage = {
            id: messages.length + 2,
            text: "Sorry, I'm having trouble connecting. Please try again later or contact support.",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          toast.error("Failed to get response from assistant");
        }

        setIsLoading(false);
      }, 1000); // 1 second delay for realistic typing effect
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);

      const errorMessage = {
        id: messages.length + 2,
        text: "Oops! There was an error connecting to the assistant. Please check your internet connection.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Network error. Please try again.");
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Quick questions suggestions
  const quickQuestions = [
    "What are your shipping policies?",
    "How can I track my order?",
    "What is your return policy?",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-btn fixed bottom-2 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes className="h-6 w-6" />
        ) : (
          <FaCommentDots className="h-6 w-6" />
        )}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs animate-pulse">
            !
          </div>
        )}
        <span className="absolute right-16 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isOpen ? "Close Chat" : "Ask a Question"}
        </span>
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div
          ref={chatBoxRef}
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-slide-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <FaRobot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">FAQ Assistant</h3>
                <p className="text-sm text-blue-100">Ask me anything!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-2"
              aria-label="Close chat"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === "user" ? "text-right" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {message.sender === "bot" && (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaRobot className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.sender === "user"
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaUser className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaRobot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="bg-white text-gray-800 shadow-sm rounded-2xl rounded-tl-none border border-gray-100 px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                QUICK QUESTIONS:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your question here..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <FaSpinner className="h-5 w-5 animate-spin" />
                ) : (
                  <FaPaperPlane className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Press Enter to send • Our AI assistant is here to help!
            </p>
          </form>
        </div>
      )}

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatBox;
