import React, { useState, useRef } from 'react';
import ImageCropper from '../ProfileSection/ImageCropper';
import postService from '../../../../services/postService';
import { useAuth } from '../../../../context/AuthContext';

const CreatePost = ({ onBack, onPost }) => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [isCropping, setIsCropping] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setTempImage(reader.result);
                    setIsCropping(true);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
            }
        }
    };

    const handleCropComplete = (croppedImageBlob) => {
        const croppedFile = new File([croppedImageBlob], "post-image.jpg", { type: "image/jpeg" });
        setFile(croppedFile);
        setPreview(URL.createObjectURL(croppedImageBlob));
        setIsCropping(false);
        setTempImage(null);
    };

    const handlePost = async () => {
        if (!file || loading) return;
        
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('media', file);
            formData.append('caption', caption);
            formData.append('visibility', 'public');

            const result = await postService.createPost(formData);
            
            if (result.success) {
                if (onPost) onPost(result.data);
                onBack();
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            alert(error.response?.data?.message || 'Failed to share post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: 'white',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: "'DM Sans', sans-serif"
        }}>
            <style>{`
                .upload-area {
                    width: 100%;
                    max-width: 500px;
                    aspect-ratio: 4/5;
                    border: 1px dashed #333;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #111;
                    overflow: hidden;
                    position: relative;
                }
                .upload-area:hover {
                    border-color: #555;
                    background: #1a1a1a;
                }
                .preview-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .input-field {
                    width: 100%;
                    max-width: 500px;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #333;
                    color: white;
                    padding: 12px 0;
                    margin-top: 24px;
                    outline: none;
                    font-size: 16px;
                }
                .input-field:focus {
                    border-bottom-color: #555;
                }
                .header-actions {
                    width: 100%;
                    max-width: 500px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .btn-post {
                    color: #0095f6;
                    font-weight: bold;
                    background: none;
                    border: none;
                    font-size: 16px;
                }
                .btn-post:disabled {
                    opacity: 0.5;
                    cursor: default;
                }
            `}</style>

            <div className="header-actions">
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>New Post</div>
                <button 
                    className="btn-post" 
                    onClick={handlePost} 
                    disabled={!file || loading}
                >
                    {loading ? 'Sharing...' : 'Share'}
                </button>
            </div>

            <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                {preview ? (
                    <img src={preview} alt="preview" className="preview-img" />
                ) : (
                    <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p style={{ marginTop: '16px', color: '#888' }}>Upload photos and videos</p>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,video/*" 
                    onChange={handleFileChange} 
                />
            </div>

            <textarea 
                className="input-field" 
                placeholder="Write a caption..." 
                rows="3"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
            />

            {isCropping && (
                <ImageCropper 
                    image={tempImage}
                    aspect={4/5}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropping(false);
                        setTempImage(null);
                    }}
                />
            )}
        </div>
    );
};

export default CreatePost;
