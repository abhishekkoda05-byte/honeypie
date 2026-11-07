import { useState, useEffect } from "react";
import API_URL from "./config";
import "./css/outgoing.css";

function outGoing(){
    const [ requests, setrequests ] = useState([]);
    const [ loading, setloading ] = useState(true);
    const [ error, seterror ] = useState("");

    useEffect(() => {
       async function Harshini(){
         const token = localStorage.getItem("honeypieToken");
        try{
            const response = await fetch(`${API_URL}/swap/outgoing`, {
                 headers : {
                      Authorization : `Bearer ${token}`
                }
            }
            );
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.message);
            } 
            setrequests(data.requests);
        }catch(error){
            console.error(error.message);
            seterror(error.message);
        }finally{
            setloading(false)
        }
       }
       Harshini();
    }, [])
    if(loading){
        return (
            <p className="outgoing-status-message">loading....</p>
        )
    }
    if(error){
        return (
            <p className="outgoing-status-message">
                error:{error}
            </p>
        )
    }
    return (
        <div className="outgoing-page">
            <header className="outgoing-header">
                <h1 className="outgoing-heading">Outgoing Swap Requests</h1>
                <p className="outgoing-subtitle">
                    Track the swap requests you have sent.
                </p>
            </header>

            {requests.length === 0 ? (
                <p className="outgoing-empty">No outgoing requests found.</p>
            ) : (
                <div className="outgoing-list">
                    {requests.map((item) => (
                        <article className="outgoing-card" key={item._id}>
                            <header className="outgoing-card-header">
                                <h3 className="outgoing-owner">
                                    Owner: {item.owner?.name}
                                </h3>

                                <span
                                    className={`outgoing-status outgoing-status-${item.status}`}
                                >
                                    Status: {item.status}
                                </span>
                            </header>

                            <div className="outgoing-products">
                                <div className="outgoing-product outgoing-product-requested">
                                    <h4 className="outgoing-product-label">
                                        Requested Product
                                    </h4>

                                    <img
                                        className="outgoing-product-image"
                                        src={item.requestedProduct?.images?.[0]?.imageUrl}
                                        alt={item.requestedProduct?.title}
                                        width="150"
                                    />

                                    <p className="outgoing-product-title">
                                        {item.requestedProduct?.title}
                                    </p>
                                </div>

                                <div className="outgoing-product outgoing-product-offered">
                                    <h4 className="outgoing-product-label">
                                        Your Offered Product
                                    </h4>

                                    <img
                                        className="outgoing-product-image"
                                        src={item.offeredProduct?.images?.[0]?.imageUrl}
                                        alt={item.offeredProduct?.title}
                                        width="150"
                                    />

                                    <p className="outgoing-product-title">
                                        {item.offeredProduct?.title}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default outGoing ; 