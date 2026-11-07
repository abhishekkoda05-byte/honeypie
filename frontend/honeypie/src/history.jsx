import { useState, useEffect } from "react";
import API_URL from "./config";
import "./css/history.css";

function CheckHistory(){
    const [ history, sethistory ] = useState([]);
    const [ loading, setloading ] = useState(true);
    const [ error, seterror ] = useState("");

    useEffect(() => { 
        const token = localStorage.getItem("honeypieToken");
        async function Harshini(){
          try{
            const response = await fetch(`${API_URL}/swap/history`, {
                headers : {
                    Authorization : `Bearer ${token}`
                }
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.message);
            }
            sethistory(data.history);
          }catch(error){
            console.error(error.message);
            seterror(error.message);
          }finally{
            setloading(false);
          }
        }
        Harshini();
    } ,[]);
    if(loading){
        return <p className="history-status-message">loading...</p>
    } 
    if(error){
        return <p className="history-status-message">error:{error}</p>
    }
    return(
        <div className="history-page">
            <header className="history-header">
                <h1 className="history-heading">Swap History</h1>
                <p className="history-subtitle">
                    View your completed clothing exchanges.
                </p>
            </header>

            {history.length === 0 ? (
                <p className="history-empty">No completed swaps yet.</p>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <article className="history-card" key={item._id}>
                            <header className="history-card-header">
                                <div className="history-users">
                                    <h3 className="history-user">
                                        Requester: {item.requester?.name}
                                    </h3>
                                    <h3 className="history-user">
                                        Owner: {item.owner?.name}
                                    </h3>
                                </div>

                                <span
                                    className={`history-status history-status-${item.status}`}
                                >
                                    Status: {item.status}
                                </span>
                            </header>

                            <div className="history-products">
                                <div className="history-product history-product-requested">
                                    <h4 className="history-product-label">
                                        Requested Product
                                    </h4>

                                    <img
                                        className="history-product-image"
                                        src={item.requestedProduct?.images?.[0]?.imageUrl}
                                        alt={item.requestedProduct?.title}
                                        width="150"
                                    />

                                    <p className="history-product-title">
                                        {item.requestedProduct?.title}
                                    </p>
                                </div>

                                <div className="history-product history-product-offered">
                                    <h4 className="history-product-label">
                                        Offered Product
                                    </h4>

                                    <img
                                        className="history-product-image"
                                        src={item.offeredProduct?.images?.[0]?.imageUrl}
                                        alt={item.offeredProduct?.title}
                                        width="150"
                                    />

                                    <p className="history-product-title">
                                        {item.offeredProduct?.title}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CheckHistory;