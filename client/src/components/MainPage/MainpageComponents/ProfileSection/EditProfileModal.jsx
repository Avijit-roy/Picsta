import { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";
import userService from "../../../../services/userService";

export default function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [formData, setFormData] = useState(userData);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });

  useEffect(() => {
    if (isOpen && userData) {
      // Ensure username starts with @ on load
      const initialData = { ...userData };
      if (initialData.username && !initialData.username.startsWith('@')) {
        initialData.username = '@' + initialData.username;
      }
      
      // Use a timeout to avoid synchronous set state in effect warming
      const t = setTimeout(() => {
        setFormData(initialData);
        setPreviewUrl(userData.profilePicture);
        setProfilePictureFile(null);
        setErrors({});
        setTempImage(null);
        setShowCropper(false);
        setUsernameStatus({ checking: false, available: null, message: '' });
      }, 0);
      
      document.body.style.overflow = "hidden";
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen, userData]);

  useEffect(() => {
    const checkUsername = async () => {
      const usernamePart = formData.username.substring(1).toLowerCase();
      
      // Don't check if it's the same as current or formData is not set yet
      if (!formData || !formData.username || formData.username === userData.username) {
        setUsernameStatus({ checking: false, available: null, message: '' });
        return;
      }

      // Don't check if too short/invalid
      if (usernamePart.length < 4) {
        setUsernameStatus({ checking: false, available: null, message: '' });
        return;
      }

      setUsernameStatus(prev => ({ ...prev, checking: true }));
      try {
        const result = await userService.checkUsername(formData.username);
        setUsernameStatus({
          checking: false,
          available: result.available,
          message: result.message
        });
      } catch (error) {
        console.error("Check username error:", error);
        setUsernameStatus({ checking: false, available: null, message: '' });
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username !== userData.username) {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, userData.username, formData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    
    const unifiedRegex = /^(?![_])(?!.*__)(?![a-z0-9_]*_$)[a-z0-9_]{4,20}$/;
    const reserved = ['admin', 'support', 'picsta', 'official', 'moderator', 'staff'];

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else {
      const normalizedName = formData.name.trim().toLowerCase();
      if (!unifiedRegex.test(normalizedName) || !/[a-z]/.test(normalizedName)) {
        newErrors.name = "Name must be 4-20 chars, use only letters/numbers/underscores, and have at least one letter";
      } else if (reserved.includes(normalizedName)) {
        newErrors.name = "This name is reserved";
      }
    }

    // Username validation
    const usernamePart = formData.username.substring(1).toLowerCase();
    if (usernamePart.length < 4 || usernamePart.length > 20) {
      newErrors.username = "Username must be 4-20 characters long";
    } else if (!unifiedRegex.test(usernamePart) || !/[a-z]/.test(usernamePart)) {
      newErrors.username = "Username must use only letters/numbers/underscores, and have at least one letter";
    } else if (reserved.includes(usernamePart)) {
      newErrors.username = "This username is reserved";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "username") {
      // Ensure it starts with @
      if (!value.startsWith('@')) {
        value = '@' + value.replace(/[@]/g, '');
      }
      // Only keep @ + lowercase allowed chars
      const prefix = value.charAt(0);
      const rest = value.substring(1).toLowerCase().replace(/[^a-z0-9_]/g, '');
      // Prevent double underscores
      const cleanRest = rest.replace(/__+/g, '_');
      value = prefix + cleanRest;
      
      if (value.length > 21) value = value.substring(0, 21);
    }

    if (name === "name") {
      // Allow lowercase letters, numbers, underscores
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      // Prevent consecutive underscores
      value = value.replace(/__+/g, '_');
      if (value.length > 20) value = value.substring(0, 20);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], "profile-picture.jpg", { type: "image/jpeg" });
    setProfilePictureFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData, profilePictureFile });
      onClose();
    }
  };

  const triggerFileInput = () => {
    document.getElementById("avatar-input").click();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-content {
          animation: slideUp 0.3s ease;
          scrollbar-width: none;
        }
        .modal-content::-webkit-scrollbar {
          display: none;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-label {
          display: block;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: #e8e8e8;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }
        .form-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.02);
        }
        .form-input.error {
          border-color: #ff4d4d;
          background: rgba(255, 77, 77, 0.05);
        }
        .error-text {
          color: #ff4d4d;
          font-size: 11px;
          margin-top: 6px;
          display: block;
          font-weight: 400;
        }
        .form-textarea {
          resize: none;
          min-height: 100px;
        }
        .save-btn {
          background: #f0f0f0;
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .save-btn:hover {
          background: #fff;
          transform: translateY(-1px);
        }
        .save-btn:active {
          transform: translateY(0);
        }
        .cancel-btn {
          background: transparent;
          color: #888;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          color: #ccc;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", letterSpacing: "-0.02em" }}>
          Edit Profile
        </h2>

        <form onSubmit={handleSave} noValidate>
          {/* Profile Picture */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div style={{
              width: "100px", height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #333 0%, #555 100%)",
              padding: "2px",
              position: "relative",
              marginBottom: "12px",
            }}>
              <input 
                type="file" 
                id="avatar-input" 
                hidden 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                background: "#1a1a1a",
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img 
                  src={previewUrl} 
                  alt="preview" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <button 
                type="button"
                onClick={triggerFileInput}
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: 10,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: "400" }}>Change profile picture</span>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`} 
              value={formData.name || ''} 
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="off"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`} 
              value={formData.username || ''} 
              onChange={handleChange}
              placeholder="@username"
              style={{ fontFamily: "'DM Mono', monospace" }}
              autoComplete="off"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
            {!errors.username && usernameStatus.message && (
              <span style={{ 
                fontSize: '11px', 
                marginTop: '6px', 
                display: 'block',
                color: usernameStatus.available ? '#4ade80' : '#ff4d4d' 
              }}>
                {usernameStatus.checking ? 'Checking availability...' : usernameStatus.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Bio</label>
              <span style={{ fontSize: "11px", color: (formData.bio || '').length >= 150 ? "#ff4d4d" : "#555", letterSpacing: "0.05em" }}>
                {(formData.bio || '').length}/150
              </span>
            </div>
            <textarea 
              name="bio"
              className="form-input form-textarea" 
              value={formData.bio || ''} 
              onChange={handleChange}
              placeholder="Write something about yourself..."
              maxLength={150}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input 
                type="date" 
                name="dob"
                className="form-input" 
                value={formData.dob || ''} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                name="gender"
                className="form-input" 
                value={formData.gender || 'Not Specified'} 
                onChange={handleChange}
                style={{ appearance: "none" }}
              >
                <option value="Not Specified">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
            <button type="button" className="cancel-btn" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              style={{ flex: 1, opacity: (usernameStatus.available === false || usernameStatus.checking) ? 0.5 : 1 }}
              disabled={usernameStatus.available === false || usernameStatus.checking}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}
