import {  useState } from  "react" ;
import { useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "./config";


function productForm({currentUser}) {
    const [title, settitle ] = useState("");
    const [price, setprice ] = useState("");
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
        <div>
            <h1>List your products</h1>
    <form onSubmit={handleSubmit}>
          <input type="file"
          accept="image/*"
          multiple
          onChange={(e) => {setimages(Array.from(e.target.files).slice(0, 5))}}
          />
                <input 
            placeholder ="title"
            type="text"
            value={title}
            onChange={(e) => settitle(e.target.value)}
            />
            <input 
            placeholder ="price"
            type="number"
            value={price}
            onChange={(e) => setprice(e.target.value)}
            />
            <textarea
            placeholder ="description"
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            />
           <button type="submit" disabled = {loading}>{loading? "uploading..." : "upload"}</button>
    </form>
    <div className="product-list">
         {products.map((item) => {    
            return  (
         <div key={item._id} className="product-card">
            <Link to={`/products/${item._id}`}>
              <img src={item.images?.[0]?.imageUrl} alt={item.title} width="150" />
         
            <h3>{item.title}</h3>
            <p>₹{item.price}</p>
            </Link>
            {item.owner === currentUser._id && (
           <button onClick={() => handleDelete(item._id)} disabled={deleteing}>
             {deleteing ? "deleting..." : "delete"}
           </button>
)}
        </div>
            )
         })}
    </div>
        </div>
      
    );
}

export default productForm;