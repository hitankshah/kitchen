import React, { useContext, useState, useEffect } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useAuth } from '../../Context/AuthContext'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const { signUp, signIn, resendVerification, resetPassword, user, userProfile } = useAuth()
    
    const [currState, setCurrState] = useState("Sign Up");
    const [showVerification, setShowVerification] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    })

    // Sync session token when user logs in successfully
    useEffect(() => {
        const syncToken = async () => {
            if (user) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.access_token) {
                        setToken(session.access_token);
                        localStorage.setItem("token", session.access_token);
                        localStorage.setItem("supabase_authenticated", "true");
                    }
                } catch (error) {
                    console.error("Token sync error:", error);
                }
            }
        };
        syncToken();
    }, [user, setToken]);

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (currState === "Login") {
                await signIn(data.email, data.password)
                
                // Wait a moment for Supabase to update session
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get the session token and sync it
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    setToken(session.access_token);
                    localStorage.setItem("token", session.access_token);
                    localStorage.setItem("supabase_authenticated", "true");
                    console.log("✅ Token synced:", session.access_token.substring(0, 20) + "...");
                } else {
                    console.warn("⚠️ No session token found");
                }
                
                toast.success("Login successful!")
                
                // Wait for React to batch and apply all state updates
                await new Promise(resolve => {
                    setTimeout(() => {
                        // Force browser to complete a render cycle
                        requestAnimationFrame(() => {
                            resolve();
                        });
                    }, 1000);
                });
                
                setShowLogin(false)
                
                // Reset form
                setData({ name: "", email: "", password: "", phone: "" })
                setCurrState("Sign Up")
            } else {
                // Sign Up
                if (!data.phone) {
                    toast.error("Phone number is required")
                    setLoading(false)
                    return
                }
                await signUp(data.email, data.password, data.name, data.phone)
                toast.success("Account created! Check your email to verify.")
                setShowVerification(true)
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleResendVerification = async () => {
        try {
            setLoading(true)
            await resendVerification(data.email)
            toast.success("Verification email sent! Check your inbox.")
        } catch (error) {
            toast.error(error.message || "Failed to resend verification email")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!data.email) {
            toast.error("Please enter your email address")
            return
        }
        try {
            setLoading(true)
            await resetPassword(data.email)
            toast.success("Password reset email sent! Check your inbox.")
            setShowPasswordReset(true)
        } catch (error) {
            toast.error(error.message || "Failed to send reset email")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setShowLogin(false)
        setShowVerification(false)
        setShowPasswordReset(false)
        setData({ name: "", email: "", password: "", phone: "" })
        setCurrState("Sign Up")
    }

    // Email Verification View
    if (showVerification) {
        return (
            <div className='login-popup'>
                <form className="login-popup-container">
                    <div className="login-popup-title">
                        <h2>Check Your Email</h2>
                        <img onClick={handleClose} src={assets.cross_icon} alt="close" />
                    </div>
                    <div style={{ textAlign: "center", color: "#666" }}>
                        <p style={{ marginBottom: "15px" }}>We've sent a verification link to:</p>
                        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>{data.email}</p>
                        <p style={{ fontSize: "13px", marginBottom: "15px" }}>
                            Click the verification link in your email to complete your signup.
                        </p>
                    </div>
                    <button type="button" onClick={handleClose}>
                        Got it, I'll check my email
                    </button>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "13px", marginBottom: "10px" }}>Didn't receive the email?</p>
                        <p>
                            <span 
                                style={{ cursor: "pointer", color: "#FF4C24", fontWeight: "500" }}
                                onClick={handleResendVerification}
                            >
                                Resend verification email
                            </span>
                        </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <button 
                            type="button"
                            onClick={() => {
                                setShowVerification(false)
                                setData({ name: "", email: "", password: "", phone: "" })
                                setCurrState("Sign Up")
                            }}
                            style={{ 
                                backgroundColor: "transparent", 
                                color: "#FF4C24", 
                                border: "1px solid #FF4C24",
                                marginTop: "10px"
                            }}
                        >
                            Back to Sign Up
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    // Password Reset View
    if (showPasswordReset) {
        return (
            <div className='login-popup'>
                <form className="login-popup-container">
                    <div className="login-popup-title">
                        <h2>Reset Password</h2>
                        <img onClick={handleClose} src={assets.cross_icon} alt="close" />
                    </div>
                    <div style={{ textAlign: "center", color: "#666" }}>
                        <p style={{ marginBottom: "15px" }}>We've sent a password reset link to:</p>
                        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>{data.email}</p>
                        <p style={{ fontSize: "13px", marginBottom: "15px" }}>
                            Click the reset link in your email to create a new password.
                        </p>
                    </div>
                    <button type="button" onClick={handleClose}>
                        Got it, I'll check my email
                    </button>
                    <div style={{ textAlign: "center" }}>
                        <button 
                            type="button"
                            onClick={() => {
                                setShowPasswordReset(false)
                                setData({ name: "", email: "", password: "", phone: "" })
                                setCurrState("Login")
                            }}
                            style={{ 
                                backgroundColor: "transparent", 
                                color: "#FF4C24", 
                                border: "1px solid #FF4C24",
                                marginTop: "10px"
                            }}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    // Main Login/Sign Up Form
    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={handleClose} src={assets.cross_icon} alt="close" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" ? (
                        <>
                            <input 
                                name='name' 
                                onChange={onChangeHandler} 
                                value={data.name} 
                                type="text" 
                                placeholder='Your name' 
                                required 
                            />
                            <input 
                                name='phone' 
                                onChange={onChangeHandler} 
                                value={data.phone} 
                                type="tel" 
                                placeholder='Phone number' 
                                inputMode="numeric"
                                required 
                            />
                        </>
                    ) : null}
                    <input 
                        name='email' 
                        onChange={onChangeHandler} 
                        value={data.email} 
                        type="email" 
                        placeholder='Your email' 
                        required
                    />
                    <input 
                        name='password' 
                        onChange={onChangeHandler} 
                        value={data.password} 
                        type="password" 
                        placeholder='Password' 
                        required 
                    />
                </div>
                <button disabled={loading}>
                    {loading ? "Please wait..." : currState === "Login" ? "Login" : "Create account"}
                </button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, i agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login" ? (
                    <>
                        <p>
                            Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span>
                        </p>
                        <p style={{ textAlign: "center" }}>
                            <span 
                                onClick={handlePasswordReset}
                                style={{ cursor: "pointer", color: "#FF4C24", fontWeight: "500" }}
                            >
                                Forgot password?
                            </span>
                        </p>
                    </>
                ) : (
                    <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                )}
            </form>
        </div>
    )
}

export default LoginPopup
