import {  useState } from  "react" ;
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Profile from "./profile";
import incoming from "./incoming"
import outGoing from "./outgoing"
import API_URL from "./config";
import "./css/product.css";


function productForm({currentUser}) {
    const [title, settitle ] = useState("");
    const [price, setprice ] = useState("");
    const [ size, setsize ] = useState("");
    const [ brand, setbrand ] = useState("");
    const [description, setdescription ]  = useState("");
    const [images, setimages ] = useState([]);
    const [products, setproducts ] = useState([]); 
    const [loading, setloading] = useState(false);
    const [deleteing, setdeleteing] = useState(false);
   useEffect(() => {
     async function displayProducts(){
        try{
            const response = await fetch(`${API_URL}/product`);
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || "Something went wrong");
            }
            setproducts(data);
        }catch(error){
            console.error(error.message);
        }
     }
     displayProducts();
   }, []);
    async function handleSubmit(e){
      e.preventDefault();
     
         if(!images || images.length === 0){
        alert("Please upload an image");
        return;
      }
       setloading(true);
try{
    
      const newdata = new FormData();
      newdata.append("title", title);
      newdata.append("price", price);
      newdata.append("description", description);
      newdata.append("size", size);
      newdata.append("brand", brand);
      images.forEach((file) => {
        newdata.append("images", file);
      });

      const response = await fetch(`${API_URL}/product/upload`, {
        method: "POST",
          headers: {
        Authorization: `Bearer ${localStorage.getItem("honeypieToken")}`
    },
        body: newdata
      });
      const data = await response.json();
      if(!response.ok){
        throw new Error(data.message || "Something went wrong");
      }
      setproducts((previous) => [...previous, data.product]);
     settitle("");
    setprice("");
    setbrand("");
    setsize("");
    setdescription("");
    setimages([]);

      alert("product uploaded successfully");
   
}catch(error){
    console.error(error.message);
    alert(error.message);
} finally{
    setloading(false);
}
    }
    async function handleDelete(id){
        setdeleteing(true);
        try{
           const response = await fetch(`${API_URL}/product/${id}`, {
            method:"DELETE",
            headers: {
                Authorization : `Bearer ${localStorage.getItem("honeypieToken")}`
            } 
           });
           const data = await response.json();
            if(!response.ok){
                throw new Error(data.message || "Something went wrong");
            }

            setproducts((previous) =>  previous.filter((item) => item._id !== id));
            alert("product deleted successfully");
        }catch(error){
            console.error(error.message);
           alert(error.message);
        }finally{
            setdeleteing(false);
        }
    }
    console.log("Current user:", currentUser);
    
    return (
        <div className="products-page">
            
           <Link className="products-nav-link" to="/incoming">
                Incoming Requests
            </Link>
            <Link className="products-nav-link" to="/outgoing">Outgoing Requests</Link>
            <h1 className="products-heading">List your products</h1>

    <form className="product-upload-card" onSubmit={handleSubmit}>
          <input
          className="product-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {setimages(Array.from(e.target.files).slice(0, 5))}}
          />
                <input 
            className="product-input"
            placeholder ="title"
            type="text"
            value={title}
            onChange={(e) => settitle(e.target.value)}
            />
            <input 
            className="product-input"
            placeholder ="price"
            type="number"
            value={price}
            onChange={(e) => setprice(e.target.value)}
            />
            <input
            className="product-input"
            placeholder="size"
            type="text"
            value={size}
            onChange={(e) => setsize(e.target.value)}
            />
             <input
            className="product-input"
            placeholder="brand"
            type="text"
            value={brand}
            onChange={(e) => setbrand(e.target.value)}
            />
            <textarea
            className="product-textarea"
            placeholder ="description"
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            />
           <button className="product-submit" type="submit" disabled = {loading}>{loading? "uploading..." : "upload"}</button>
    </form>
    <div className="product-list">
         {products.map((item) => {    
            return  (
         <div key={item._id} className="product-card">
            
            {item.owner === currentUser._id && (
             <> 
             <Link className="product-link" to={`/products/${item._id}`}>
                <img className="product-thumb" src={item.images?.[0]?.imageUrl} alt={item.title} width="150" />
             <h3 className="product-name">{item.title}</h3>
             <p className="product-cost">₹{item.price}</p>
           <button className="product-delete" onClick={() => handleDelete(item._id)} disabled={deleteing}>
             {deleteing ? "deleting..." : "delete"}
           </button>
           </Link>
             </>
)}
        </div>
            )
         })}
    </div>
        </div>
    
    );
}

export default productForm;