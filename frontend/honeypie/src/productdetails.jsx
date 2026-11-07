
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import API_URL from "./config";
import "./css/productdetails.css";

function ProductDetails({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
  

    // Fetch individual product
    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(
                    `${API_URL}/product/products/${id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Product not found");
                }

                setProduct(data.existingproduct);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);
    if (loading) {
        return <h2 className="details-status">Loading product...</h2>;
    }

    if (!product) {
        return <h2 className="details-status">Product not found</h2>;
    }

    const isOwner =
        currentUser &&
        product.owner?.toString() === currentUser._id?.toString();

    return (
        <div className="product-details">

            <Link className="details-back-link" to="/">← Back to products</Link>

            <div className="details-container">

                {/* Product Images */}
                <div className="details-images">

                    <img
                        className="hero-image details-main-image"
                        src={product.images?.[selectedImage]?.imageUrl}
                        alt={product.title}
                        width = "150"
                    />

                    <div className="thumbnail-container">
                        {product.images?.slice(0, 5).map((image, index) => (
                            <img
                                key={index}
                                src={image.imageUrl}
                                alt={`${product.title} ${index + 1}`}
                                onClick={() => setSelectedImage(index)}
                                className={
                                    selectedImage === index
                                        ? "details-thumbnail active-thumbnail"
                                        : "details-thumbnail thumbnail"
                                }
                                width ="150"
                            />
                        ))}
                    </div>

                </div>

                {/* Product Information */}
                <div className="details-info">

                    <h1 className="details-title">{product.title}</h1>

                    <h2 className="details-price">₹{product.price}</h2>

                    <div className="details-meta-row">
                        <p className="details-meta"><strong>Brand:</strong> {product.brand}</p>

                        <p className="details-meta"><strong>Size:</strong> {product.size}</p>
                    </div>

                    <p className="details-description">description :{product.description}</p>

                    <div className="details-actions">
                        {!isOwner && (
                            <button
                                className="details-swap-button"
                                onClick={() => {
                                    const ownerId =
                                        typeof product.owner === "object"
                                            ? product.owner?._id
                                            : product.owner;

                                    navigate(`/owner/${ownerId}`, {
                                        state: {
                                            requestedProductId: product._id
                                        }
                                    });
                                }}
                            >
                                Swap
                            </button>
                        )}
                           <button
                                className="details-chat-button"
                                onClick={() => {
                                    const ownerId =
                                        typeof product.owner === "object"
                                            ? product.owner?._id
                                            : product.owner;

                                    navigate(`/chat/${ownerId}`);
                                }}
                            >
                                Chat with Owner
                     </button>
                    </div>
                    
                </div>

            </div>
        </div>
    );
}

export default ProductDetails;
