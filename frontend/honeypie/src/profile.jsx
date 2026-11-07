
import { useState, useEffect } from "react";
import API_URL from "./config";
import { Link } from "react-router-dom";
import CheckHistory from "./history";
import "./css/profile.css";

const API = `${API_URL}/product`;

function Profile() {
    const [name, setname] = useState("");
    const [location, setlocation] = useState("");
    const [bio, setbio] = useState("");
    const [image, setimage] = useState(null);
    const [loading, setloading] = useState(true);
    const [message, setmessage] = useState("");
    const [profile, setprofile] = useState(null);
    const [save, setsave] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("honeypieToken");

                const response = await fetch(`${API}/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();

                setprofile(data.user);
                setname(data.user.name || "");
                setlocation(data.user.location || "");
                setbio(data.user.bio || "");

            } catch (error) {
                console.error(error.message);
                setmessage(error.message || "Server did not respond");
            } finally {
                setloading(false);
            }
        }

        fetchData();
    }, []);

    async function handle(e) {
        e.preventDefault();

        try {
            setsave(true);
            setmessage("");

            const token = localStorage.getItem("honeypieToken");

            const formdata = new FormData();

            formdata.append("name", name);
            formdata.append("location", location);
            formdata.append("bio", bio);

            if (image) {
                formdata.append("image", image);
            }

            const response = await fetch(`${API}/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formdata
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Profile update failed");
            }

            setprofile(data.user);
            setimage(null);
            
            setmessage("Profile updated successfully");

        } catch (error) {
            console.error(error.message);
            setmessage(error.message || "Server did not respond");
        } finally {
            setsave(false);
        }
    }

    if (loading) {
        return <p className="profile-status">Loading...</p>;
    }

    if (!profile) {
        return <p className="profile-status">{message || "Profile not found"}</p>;
    }

    return (
        <div className="profile-page">
            <h1 className="profile-heading">Profile</h1>

            <header className="profile-header">
                {profile.profileImage && (
                    <img
                        className="profile-avatar"
                        src={profile.profileImage}
                        alt="avatar"
                        width="150"
                    />
                )}

                <div className="profile-identity">
                    <p className="profile-name">{profile.name}</p>
                    <p className="profile-location">{profile.location}</p>
                    <p className="profile-bio">{profile.bio}</p>
                </div>
            </header>
                 
            <form className="profile-form" onSubmit={handle}>
                <div className="profile-field">
                    <label className="profile-label">Name</label>
                    <input
                        className="profile-input"
                        type="text"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
                    />
                </div>

                <div className="profile-field">
                    <label className="profile-label">Email</label>
                    <input
                        className="profile-input profile-input-readonly"
                        type="email"
                        value={profile.email}
                        readOnly
                    />
                </div>

                <div className="profile-field profile-field-wide">
                    <label className="profile-label">Location</label>
                    <input
                        className="profile-input"
                        type="text"
                        value={location}
                        onChange={(e) => setlocation(e.target.value)}
                    />
                </div>

                <div className="profile-field profile-field-wide">
                    <label className="profile-label">Bio</label>
                    <textarea
                        className="profile-textarea"
                        value={bio}
                        onChange={(e) => setbio(e.target.value)}
                    />
                </div>

                <div className="profile-field profile-field-wide">
                    <label className="profile-label">Profile Image</label>
                    <input
                        className="profile-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setimage(e.target.files[0] || null)}
                    />
                </div>

                <button className="profile-save-button" type="submit" disabled={save}>
                    {save ? "Saving..." : "Save Changes"}
                </button>
            </form>


            {message && <p className="profile-message">{message}</p>}

             <Link className="profile-history-link" to="/history">Swap History</Link>
        </div>
    );
}

export default Profile;
