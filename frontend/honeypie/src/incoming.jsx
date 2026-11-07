
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from './config';
import './css/incoming.css';

function InComing() {
    const [requests, setrequests] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function Requests() {
            const token = localStorage.getItem("honeypieToken");

            try {
                const response = await fetch(`${API_URL}/swap/request`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                setrequests(data.requests);
            } catch (error) {
                console.error(error.message);
                seterror(error.message);
            } finally {
                setloading(false);
            }
        }

        Requests();
    }, []);

    async function handleResponse(id, status) {
        const token = localStorage.getItem("honeypieToken");

        try {
            const response = await fetch(`${API_URL}/swap/request/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setrequests((previous) =>
                previous.map((item) =>
                    item._id === id
                        ? { ...item, status: status }
                        : item
                )
            );

            if (status === "accepted") {
                alert("request accepted");
            }

            if (status === "rejected") {
                alert("request rejected");
            }

        } catch (error) {
            console.error(error.message);
            seterror(error.message);
        }
    }

    if (loading) {
        return <p className="incoming-status-message">loading...</p>;
    }

    if (error) {
        return <p className="incoming-status-message">error: {error}</p>;
    }

    return (
        <div className="incoming-page">
            <header className="incoming-header">
                <h1 className="incoming-heading">Incoming Swap Requests</h1>
                <p className="incoming-subtitle">
                    Review swap offers from other Honeypie members.
                </p>
            </header>

            {requests.length === 0 ? (
                <p className="incoming-empty">no incoming requests</p>
            ) : (
                <div className="incoming-list">
                    {requests.map((item) => (
                        <article className="incoming-card" key={item._id}>
                            <header className="incoming-card-header">
                                <h3 className="incoming-requester">
                                    From: {item.requester?.name}
                                </h3>

                                <span
                                    className={`incoming-status incoming-status-${item.status}`}
                                >
                                    Status: {item.status}
                                </span>
                            </header>

                            <div className="incoming-products">
                                <div className="incoming-product incoming-product-requested">
                                    <h4 className="incoming-product-label">Requested Product</h4>

                                    <img
                                        className="incoming-product-image"
                                        src={item.requestedProduct?.images?.[0]?.imageUrl}
                                        alt={item.requestedProduct?.title}
                                        width="150"
                                    />

                                    <p className="incoming-product-title">
                                        {item.requestedProduct?.title}
                                    </p>
                                    <p className="incoming-product-price">
                                        ₹{item.requestedProduct?.price}
                                    </p>
                                </div>

                                <div className="incoming-product incoming-product-offered">
                                    <h4 className="incoming-product-label">Offered Product</h4>

                                    {item.offeredProduct ? (
                                        <>
                                            <img
                                                className="incoming-product-image"
                                                src={item.offeredProduct.images?.[0]?.imageUrl}
                                                alt={item.offeredProduct.title}
                                                width="150"
                                            />

                                            <p className="incoming-product-title">
                                                {item.offeredProduct.title}
                                            </p>
                                            <p className="incoming-product-price">
                                                ₹{item.offeredProduct.price}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="incoming-product-unavailable">
                                            Offered product details unavailable.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="incoming-actions">
                                {item.status === "pending" && (
                                    <>
                                        <button
                                            className="incoming-accept-button"
                                            onClick={() =>
                                                handleResponse(item._id, "accepted")
                                            }
                                        >
                                            Accept
                                        </button>

                                        <button
                                            className="incoming-reject-button"
                                            onClick={() =>
                                                handleResponse(item._id, "rejected")
                                            }
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {item.status === "accepted" && (
                                    <button
                                        className="incoming-chat-button"
                                        onClick={() =>
                                            navigate(`/chat/${item.requester._id}`)
                                        }
                                    >
                                        Chat Now
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InComing;
