
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ProductDetails from "./productdetails";
import ProductForm from "./product";
import API_URL from "./config";
import './App.css';

const APIURL = `${API_URL}/api/auth`;

function App() {
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("honeypieUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const endpoint = isLogin ? "/login" : "/register";

            const body = isLogin
                ? { email, password }
                : { name, email, password };

            const response = await fetch(`${APIURL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            if (isLogin) {
                localStorage.setItem("honeypieToken", data.token);
                localStorage.setItem(
                    "honeypieUser",
                    JSON.stringify(data.user)
                );

                setCurrentUser(data.user);
                setMessage("Login successful!");
            } else {
                setMessage("Account created successfully! Please login.");

                setIsLogin(true);
                setName("");
                setEmail("");
                setPassword("");
            }

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("honeypieToken");
        localStorage.removeItem("honeypieUser");

        setCurrentUser(null);
        setName("");
        setEmail("");
        setPassword("");
        setMessage("");
        setIsLogin(true);
    }

    return (
        <Routes>

            {/* Main application and authentication */}
            <Route
                path="/"
                element={
                    <div className="app-container">

                        {currentUser ? (
                            <>
                                <ProductForm currentUser={currentUser} />

                                <button
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="auth-card">

                                <h1 className="logo">honeypie.</h1>

                                <p className="subtitle">
                                    Your style, your story.
                                </p>

                                <div className="toggle-buttons">

                                    <button
                                        className={isLogin ? "active" : ""}
                                        onClick={() => {
                                            setIsLogin(true);
                                            setMessage("");
                                        }}
                                    >
                                        Login
                                    </button>

                                    <button
                                        className={!isLogin ? "active" : ""}
                                        onClick={() => {
                                            setIsLogin(false);
                                            setMessage("");
                                        }}
                                    >
                                        Create Account
                                    </button>

                                </div>

                                <h2>
                                    {isLogin
                                        ? "Welcome Back!"
                                        : "Create Your Account"}
                                </h2>

                                <p className="form-subtitle">
                                    {isLogin
                                        ? "Login to continue to Honeypie."
                                        : "Join Honeypie and get started."}
                                </p>

                                <form onSubmit={handleSubmit}>

                                    {!isLogin && (
                                        <div className="input-group">
                                            <label>Full Name</label>

                                            <input
                                                type="text"
                                                placeholder="Enter your name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <label>Email Address</label>

                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Password</label>

                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {message && (
                                        <p className="message">
                                            {message}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="main-button"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Please wait..."
                                            : isLogin
                                                ? "Login"
                                                : "Create Account"}
                                    </button>

                                </form>

                                <p className="switch-text">
                                    {isLogin
                                        ? "Don't have an account?"
                                        : "Already have an account?"}

                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setMessage("");
                                        }}
                                    >
                                        {isLogin
                                            ? " Create Account"
                                            : " Login"}
                                    </button>
                                </p>

                            </div>
                        )}

                    </div>
                }
            />

            {/* Independent public product details page */}
            <Route
                path="/products/:id"
                element={<ProductDetails />}
            />

        </Routes>
    );
}

export default App;
