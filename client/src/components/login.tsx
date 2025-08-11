import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { useAuth } from "../context/useAuth";
import "../style.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation will happen automatically due to the useEffect above
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100">
      <div className="login-card p-4 rounded shadow text-center">
        <h2 className="mb-4 text-white">LOGIN</h2>
        
        {error && (
          <Alert variant="danger" onClose={clearError} dismissible>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-4">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-dark w-100 mb-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              "SIGN IN"
            )}
          </button>
          <div className="d-flex justify-content-between">
            <small className="text-white">
              <Link to="/register" className="text-info">Create Account</Link>
            </small>
            <small className="text-white">
              <Link to="/forgot-password" className="text-info">Forgot Password?</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
