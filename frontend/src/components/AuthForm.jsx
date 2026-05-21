import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, LogIn, UserPlus, ShieldAlert, Sparkles, Headphones } from "lucide-react";

export default function AuthForm() {
  const { login, register, error: authError, setError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
    setError(null);
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormError("");
    setError(null);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setError(null);

    // Basic Validations
    if (!formData.email || !formData.password) {
      setFormError("All credentials are required.");
      return;
    }
    if (!isLogin && !formData.name) {
      setFormError("Please enter your name to register.");
      return;
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await login(formData.email, formData.password);
      } else {
        res = await register(formData.name, formData.email, formData.password);
      }

      if (!res.success) {
        setFormError(res.error || "Authentication failed.");
      }
    } catch (err) {
      setFormError("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Decorative ambient glowing orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">
              <Headphones className="logo-icon animate-pulse-slow" />
              <div className="sparkle-cluster">
                <Sparkles className="sparkle-1" />
              </div>
            </div>
            <h1>Call Compliance Auditor</h1>
            <p className="auth-subtitle">
              {isLogin
                ? "Enter credentials to access the secure audit cockpit"
                : "Create a new agent account to run intelligent call audits"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name Input - Signup Only */}
            {!isLogin && (
              <div className="form-group slide-down">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required={!isLogin}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Feedback / Error states */}
            {(formError || authError) && (
              <div className="auth-error-box slide-up">
                <ShieldAlert className="error-icon" />
                <span>{formError || authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="btn-icon" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="btn-icon" />
                      Create Account
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Footer */}
          <div className="auth-footer">
            <p>
              {isLogin ? "New to compliance audits?" : "Already have an account?"}
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleMode}
                disabled={loading}
              >
                {isLogin ? "Sign Up Free" : "Sign In Here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
