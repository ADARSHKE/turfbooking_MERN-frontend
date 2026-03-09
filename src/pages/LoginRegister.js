import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./auth.css";
import bgImage from "../assets/ext.jpg";
import signUpImg from "../assets/signUpImg.jpg";
import signInImg from "../assets/signInImg.jpg";

import turf1 from "../assets/TURF1.jpg";
import turf2 from "../assets/TURF2.jpg";
import turf3 from "../assets/TURF3.jpg";
import turf4 from "../assets/TURF6.jpg";
import turf5 from "../assets/TURF5.jpg";

const LoginRegister = () => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toggleMode = () => setIsSignup(!isSignup);

  const turfImages = [turf1, turf2, turf3, turf4, turf5];
  const [currentTurf, setCurrentTurf] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTurf((prev) => (prev + 1) % turfImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [turfImages.length]);

  const openUserAuth = () => {
    setIsAdminMode(false);
    setIsSignup(false);
    setShowAuth(true);
  };

  const openAdminAuth = () => {
    setIsAdminMode(true);
    setIsSignup(false);
    setShowAuth(true);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await API.post("/auth/login", loginData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (isAdminMode && res.data.user.role !== "admin") {
        alert("This account is not an admin account");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        return;
      }

      alert("Login Successful");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);

      await API.post("/auth/register", signupData);

      alert("Registration Successful");

      setSignupData({
        name: "",
        email: "",
        password: "",
      });

      setIsSignup(false);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="full-bg"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <header className="site-header">
        <div className="navbar-overlay"></div>

        <div className="nav-inner">
          <div className="brand">
            <span className="brand-text">
              <span className="football">⚽</span>
              Kalikkalam
            </span>

            <span className="cricket">
              <span className="bat">🏏</span>
              <span className="cball">🔴</span>
            </span>
          </div>

          <nav className="nav-links" style={{ display: "flex", gap: "10px" }}>
            <button className="nav-btn" onClick={openUserAuth}>
              Login / Register
            </button>

            <button className="nav-btn" onClick={openAdminAuth}>
              Admin Login
            </button>
          </nav>
        </div>
      </header>

      <main className="page-main">
        {!showAuth ? (
          <div
            className="hero-card"
            style={{
              backgroundImage: `url(${turfImages[currentTurf]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 1s ease-in-out",
            }}
          >
            <h1>
              Book your Turf in Minutes <span className="hball">⚽</span>
            </h1>

            <p>
              Select turf, pick a date & time, and confirm your booking easily.
            </p>

            <button className="hero-cta" onClick={openUserAuth}>
              Get Started
            </button>
          </div>
        ) : (
          <div className="auth-wrapper">
            <button className="close-auth" onClick={() => setShowAuth(false)}>
              ✕
            </button>

            <div className={`cont ${isSignup ? "s--signup" : ""}`}>
              <div className="form sign-in">
                <h2>{isAdminMode ? "Admin Login" : "Welcome"}</h2>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                  />
                </label>

                <button
                  className="submit"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : isAdminMode
                    ? "Admin Sign In"
                    : "Sign In"}
                </button>
              </div>

              <div className="sub-cont">
                <div
                  className="img"
                  style={{
                    backgroundImage: `url(${isSignup ? signUpImg : signInImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "background-image 0.5s ease-in-out",
                  }}
                >
                  <div className="img__text m--up">
                    <h3>Don't have an account? Please Sign up!</h3>
                  </div>

                  <div className="img__text m--in">
                    <h3>If you already have an account, just sign in.</h3>
                  </div>

                  {!isAdminMode && (
                    <div className="img__btn" onClick={toggleMode}>
                      <span className="m--up">Sign Up</span>
                      <span className="m--in">Sign In</span>
                    </div>
                  )}
                </div>

                <div className="form sign-up">
                  <h2>Create your Account</h2>

                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      value={signupData.name}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          name: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                    />
                  </label>

                  <button
                    className="submit"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="premium-footer">
        <div className="footer-container">
          <div className="footer-left">
            <h2 className="footer-logo">
              <span className="hball">⚽</span>Kalikkalam
            </h2>
            <p>India's Leading Sports Venue Booking App</p>
            <p className="download-text">
              Download Kalikkalam app for exciting offers
            </p>
          </div>

          <div className="footer-links">
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Partner With Us</li>
              <li>Book Now</li>
              <li>News & Events</li>
              <li>Careers</li>
              <li>Blogs</li>
            </ul>
          </div>

          <div className="footer-contact">
            <p>Kalikkalam</p>
            <p>Kochi, India</p>
            <p>support@kalikkalam.com</p>

            <h4 className="connect-title">Connect Us</h4>
            <div className="social-icons">
              <span>📷</span>
              <span>📘</span>
              <span>💼</span>
              <span>▶</span>
              <span>✖</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Kalikkalam | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginRegister;