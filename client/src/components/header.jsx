import { useContext, useState } from "react";
import AppContext from "../AppContext";
import Modal from "./modal";
import { fetchData } from "../api";
import { InlineSpinner } from "./loading";

export default function Header() {
  const { currentPage, setCurrentPage } = useContext(AppContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ username: '', phone_number: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetchData(endpoint, 'POST', formData);
      setMessage({ type: 'success', text: response.message || 'Success!' });
      setFormData({ username: '', phone_number: '', password: '' });
      
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="logo">DLST</div>
        <div className="navbar">
          <div
            className="navtab"
            style={
              currentPage == "announcements"
                ? { borderBottom: "5px solid crimson" }
                : {}
            }
            onClick={() => setCurrentPage("announcements")}
          >
            Home
          </div>
          <div
            className="navtab"
            style={
              currentPage == "tournaments"
                ? { borderBottom: "5px solid crimson" }
                : {}
            }
            onClick={() => setCurrentPage("tournaments")}
          >
            Tournaments
          </div>
          <div
            className="navtab"
            style={
              currentPage == "rules"
                ? { borderBottom: "5px solid crimson" }
                : {}
            }
            onClick={() => setCurrentPage("rules")}
          >
            Rules
          </div>
        </div>
        <button onClick={() => {
          setIsAuthModalOpen(true);
          setIsLogin(false);
        }}>
          Register
        </button>
      </header>

      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setMessage({ type: '', text: '' });
          setFormData({ username: '', phone_number: '', password: '' });
        }}
        title={isLogin ? "Login" : "Register New Player"}
      >
        <form onSubmit={handleAuth}>
          {message.text && (
            <div className={`${message.type}-message`}>
              {message.text}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                disabled={loading}
                placeholder="+1234567890"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={() => {
                setIsAuthModalOpen(false);
                setMessage({ type: '', text: '' });
                setFormData({ username: '', phone_number: '', password: '' });
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button modal-button-primary"
              disabled={loading}
            >
              {loading ? (
                <><InlineSpinner /> {isLogin ? 'Logging in...' : 'Registering...'}</>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ type: '', text: '' });
              }}
              style={{ color: 'crimson', cursor: 'pointer', fontWeight: 600 }}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      </Modal>
    </>
  );
}
