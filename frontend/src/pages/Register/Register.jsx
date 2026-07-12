import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../../services/authService";

import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name:"",
        email:"",
        password:"",
    });

    const [loading,setLoading]=useState(false);

    const [error,setError]=useState("");

    const handleChange=(e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };

    const handleSubmit=async(e)=>{

        e.preventDefault();

        setLoading(true);

        setError("");

        try{

            await register(formData);

            navigate("/login");

        }catch{

            setError("Registration failed.");

        }

        setLoading(false);

    };

    return(

        <div className="login-container">

            <form className="login-card" onSubmit={handleSubmit}>

                <h1>StudyHub</h1>

                <h2>Create Account</h2>

                {error && <p className="error">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />

                <button type="submit">

                    {loading ? "Creating..." : "Register"}

                </button>

                <p>

                    Already have an account?

                    <Link to="/login"> Login</Link>

                </p>

            </form>

        </div>

    )

}

export default Register;