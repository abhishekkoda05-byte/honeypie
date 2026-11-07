import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API_URL from "./config"
import heroImage from "./assets/images.jpg"
import "./css/home.css"


function Home(){
    const [ products, setproducts ] = useState([]);
    const [ searchInput, setsearchInput ] = useState("");
    const [ searchTerm, setsearchTerm ] = useState("");
    useEffect(() => {
        async function display(){
            try{
               const response = await fetch(`${API_URL}/product`);
               const data = await response.json();
               if(!response.ok){
                 throw new Error(data.message);
               }
               setproducts(data)
            }catch(error){
                console.error(error.message);
            }
        };
        display();
    }, []);

    const filteredProducts = products.filter((item) => {
   const query = searchTerm.toLowerCase().trim();

    const matchesTitle = item.title?.toLowerCase().includes(query);
    const matchesPrice = String(item.price).includes(query);

    return matchesTitle || matchesPrice;
    });
    return (
    <div className="home-page">
      <header className="navbar">
        <div className="navbar-brand">
          <h1 className="brand-logo">honeypie</h1>
        </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        setsearchTerm(searchInput);
      }}>
          <div className="navbar-search">
          <input
            className="search-input"
            placeholder="search products"
            type="text"
            value={searchInput}
            onChange={(e) => setsearchInput(e.target.value) }
          />
          <button className="search-button">search</button>
        </div>
      </form>
        <nav className="navbar-links">
          <Link className="nav-link" to="/products"> <span className="nav-accent">Upload</span></Link>
          <Link className="nav-link" to="/inbox">My <span className="nav-accent">Chats</span></Link>
          <Link className="nav-link" to="/profile">My <span className="nav-accent">Profile</span></Link>
        </nav>
      </header>
      <section className="hero">
        <div className="hero-image">
          <img src={heroImage} alt="Pre-loved fashion" />
        </div>
        <div className="hero-content">
          <h2 className="hero-title">Exchange and wear it your way</h2>
          <p className="hero-text">
            Discover unique pre-loved fashion from Honeypie.
          </p>
        </div>
      </section>
      <main className="home-main">
        <div className="products">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => {
                return (
                    <article className="product-card" key={item._id}>
                        <Link className="product-link" to={`/products/${item._id}`}>
                            <div className="product-image-wrapper">
                                <img
                                    className="product-image"
                                    src={item.images?.[0]?.imageUrl}
                                    alt={item.title}
                                />
                            </div>

                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <p className="product-price">₹{item.price}</p>
                            </div>
                        </Link>
                    </article>
                );
            })
        ) : (
            <p className="no-products">
                {products.length === 0
                    ? "No products available yet."
                    : "No products found."}
            </p>
        )}
        </div>
      </main>
     <footer className="site-footer">
        <h1 className="footer-logo">honeypie</h1>
        <nav className="footer-nav">made for : unified mentor</nav>
     </footer>
    </div>
   
    );
}

export default Home;