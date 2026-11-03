import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_URL from "./config"

function productDetails(){
    const { id } = useParams();
    const [products, setproducts ] = useState(null);
    const [ loading, setloading ] = useState(true);
    const [ error, seterror ] = useState("");

    useEffect(() => {
        async function fetchProduct(){
            try{
                const response = await fetch(`${API_URL}/product/products/${id}`);

                const data = await response.json();
                if(!response.ok){
                    return seterror(data.message);
                }
                setproducts(data.existingproduct);

            }catch(error){
                console.error(error.message);
                seterror(error.message);
            }finally{
                setloading(false);
            }
        }
        fetchProduct();
    }, [id]);
    if(loading){
        return ( <>
         <h1>loading...</h1>
        </>) ;
    }
    if(error){
        return ( <>
         <h1>{error}</h1>
        </>)
    } 
    return ( 
        <>
        <h1>Product Details</h1>
          {products?.images?.map((image, index) => (
        <img
            key={index}
            src={image.imageUrl}
            alt={`${products.title} - image ${index + 1}`}
            width="200"
        />
    ))}
         <h1>{products.title}</h1>
         <h2>{products.price}</h2>
         <p>{products.description}</p>
        </>
    );
}

export default productDetails;