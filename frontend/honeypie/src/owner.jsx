
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom";
import API_URL from "./config"
import "./css/owner.css"

function Owner({ currentUser }) {
    const { id } = useParams();
    const location = useLocation();
    const requestedProductId = location.state?.requestedProductId;

    const [products, setproducts] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState("");
    const [selectedProduct, setselectedProduct] = useState(null);

    const [requestedProduct, setrequestedProduct] = useState(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`${API_URL}/product`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                const requested = data.find(
                    (item) => item._id === requestedProductId
                );
                setrequestedProduct(requested);

                const ownerProducts = data.filter((item) => {
                    const ownerId = typeof item.owner === "object"
                        ? item.owner?._id
                        : item.owner;

                    return ownerId?.toString() === currentUser?._id?.toString();
                });

                setproducts(ownerProducts);
            } catch (error) {
                console.error(error.message);
                seterror(error.message);
            } finally {
                setloading(false);
            }
        }

        fetchProducts();
    }, [id, currentUser?._id, requestedProductId]);

    if (loading) {
        return <h2 className="owner-status">loading....</h2>
    }

    if (error) {
        return <h2 className="owner-status">error:{error}</h2>
    }

    async function handleSelect(item) {
        setselectedProduct(item);
    }

    async function handleSwapRequest() {
        if (!selectedProduct) {
            alert("Please select a product first");
            return;
        }

        try {
            const token = localStorage.getItem("honeypieToken");

            const response = await fetch(`${API_URL}/swap/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    request: requestedProductId,
                    offer: selectedProduct._id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "failed to fetch");
            }

            alert("Swap request sent successfully!");
        } catch (error) {
            console.error(error.message || "server issues");
            alert(error.message);
        }
    }

    const requestedPrice = Number(requestedProduct?.price || 0);
    const offeredPrice = Number(selectedProduct?.price || 0);

    const total = requestedPrice + offeredPrice;
    const difference = requestedPrice - offeredPrice;

    return (
        <div className="owner-page">
            <header className="owner-header">
                <h1 className="owner-heading">Choose a Product to Swap</h1>
                <p className="owner-subtitle">
                    Select one of your own products to offer in exchange.
                </p>
            </header>

            {products.length === 0 ? (
                <p className="owner-empty">owner has not uploaded any products</p>
            ) : (
                <div className="owner-product-grid">
                    {products.map((item) => (
                        <div key={item._id} className="owner-card">
                            <img
                                className="owner-card-image"
                                src={item.images?.[0]?.imageUrl}
                                alt={item.title}
                                width="150"
                            />

                            <div className="owner-card-body">
                                <h3 className="owner-card-title">{item.title}</h3>
                                <p className="owner-card-price">₹{item.price}</p>

                                <div className="owner-card-meta">
                                    <p className="owner-meta-item">Brand: {item.brand}</p>
                                    <p className="owner-meta-item">Size: {item.size}</p>
                                </div>

                                <p className="owner-card-id">{item._id}</p>
                                <p className="owner-card-description">
                                    description : {item.description}
                                </p>

                                <button
                                    className="owner-select-button"
                                    onClick={() => handleSelect(item)}
                                >
                                    {selectedProduct?._id === item._id ? "Selected" : "Select"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <div className="swap-calculator">
                    <h2>Swap Value Calculator</h2>

                    <p>Requested Product: ₹{requestedPrice}</p>
                    <p>Your Offered Product: ₹{offeredPrice}</p>

                    <hr />

                    <h3>Total: ₹{total}</h3>
                    <h3>Difference: ₹{Math.abs(difference)}</h3>

                    <button
                        className="owner-select-button"
                        onClick={handleSwapRequest}
                    >
                        Send Swap Request
                    </button>
                </div>
            )}
        </div>
    );
}

export default Owner;