
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "./config";
import "./css/inbox.css";

function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInbox() {
            try {
                const token = localStorage.getItem("honeypieToken");

                if (!token) {
                    throw new Error("Please login first");
                }

                const response = await fetch(
                    `${API_URL}/chat/conversations`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load inbox");
                }

                setConversations(data.conversations || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchInbox();
    }, []);

    if (loading) {
        return <h2 className="inbox-loading">Loading inbox...</h2>;
    }

    return (
        <div className="inbox-page">
            <Link className="inbox-back-link" to="/">← Home</Link>

            <h1 className="inbox-heading">My Chats</h1>

            {error && <p className="inbox-error">{error}</p>}

            {!error && conversations.length === 0 && (
                <p className="inbox-empty">No conversations yet.</p>
            )}

            <div className="inbox-list">
                {conversations.map((item) => {
                    if (!item.user || !item.lastMessage) {
                        return null;
                    }

                    return (
                        <div
                            key={item.user._id}
                            className="inbox-conversation"
                            onClick={() => navigate(`/chat/${item.user._id}`)}
                        >
                            <h3 className="inbox-name">{item.user.name}</h3>

                            <p className="inbox-preview">{item.lastMessage.message}</p>

                            <small className="inbox-time">
                                {new Date(
                                    item.lastMessage.createdAt
                                ).toLocaleString()}
                            </small>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Inbox;
