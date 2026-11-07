
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_URL from "./config";
import socket from "./socket.io/socket";
import "./css/chat.css";

function Chat() {

    const { userId } = useParams();

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("honeypieToken");

    const currentUser = JSON.parse(
        localStorage.getItem("honeypieUser") || "null"
    );

    const currentUserId = currentUser?._id || currentUser?.id;

    // Add message without duplicates
    function addMessage(newMessage) {
        setMessages((previous) => {
            const alreadyExists = previous.some(
                (item) => item._id === newMessage._id
            );

            if (alreadyExists) {
                return previous;
            }

            return [...previous, newMessage];
        });
    }

    // Fetch previous chat history
    useEffect(() => {

        async function fetchMessages() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/chat/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load messages");
                }

                setMessages(data.messages || []);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMessages();

    }, [userId]);

    // Listen for incoming messages
    useEffect(() => {

        function handleReceive(newMessage) {

            const senderId = String(newMessage.sender);
            const receiverId = String(newMessage.receiver);

            const isCurrentConversation =
                (senderId === String(currentUserId) &&
                 receiverId === String(userId)) ||
                (senderId === String(userId) &&
                 receiverId === String(currentUserId));

            if (isCurrentConversation) {
                addMessage(newMessage);
            }
        }

        socket.on("receive_message", handleReceive);

        return () => {
            socket.off("receive_message", handleReceive);
        };

    }, [userId, currentUserId]);

    // Send message
    function handleSend(e) {
        e.preventDefault();

        const messageText = message.trim();

        if (!messageText || sending) {
            return;
        }

        if (!socket.connected) {
            setError("Socket is not connected. Please try again.");
            return;
        }

        setSending(true);
        setError("");

        socket.emit(
            "send_message",
            {
                receiverId: userId,
                message: messageText
            },
            (response) => {

                setSending(false);

                if (!response || !response.success) {
                    setError(response?.message || "Message sending failed");
                    return;
                }

                setMessage("");
            }
        );
    }

    return (
        <div className="chat-page">

            <div className="chat-header">
                <h2 className="chat-heading">Honeypie Chat</h2>

                <p className="chat-subtitle">Chat with user: {userId}</p>
            </div>

            <div className="chat-messages">

                {loading ? (
                    <p className="chat-status">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="chat-empty">No messages yet. Say hello!</p>
                ) : (

                    messages.map((item) => {

                        const isMine =
                            String(item.sender) === String(currentUserId);

                        return (
                            <div
                                key={item._id}
                                className={
                                    isMine
                                        ? "chat-row chat-row-mine"
                                        : "chat-row chat-row-theirs"
                                }
                            >

                                <div
                                    className={
                                        isMine
                                            ? "chat-bubble chat-bubble-mine"
                                            : "chat-bubble chat-bubble-theirs"
                                    }
                                >

                                    <p className="chat-text">
                                        {item.message}
                                    </p>

                                    <small className="chat-time">
                                        {item.createdAt
                                            ? new Date(item.createdAt)
                                                .toLocaleTimeString()
                                            : ""}
                                    </small>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

            {error && (
                <p className="chat-error">{error}</p>
            )}

            <form
                className="chat-form"
                onSubmit={handleSend}
            >

                <input
                    className="chat-input"
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    className="chat-send-button"
                    type="submit"
                    disabled={sending || !message.trim()}
                >
                    {sending ? "Sending..." : "Send"}
                </button>

            </form>

        </div>
    );
}

export default Chat;
