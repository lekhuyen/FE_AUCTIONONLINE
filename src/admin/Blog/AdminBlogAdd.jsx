import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirect after successful submission

export const AdminBlogAdd = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [blogDate, setBlogDate] = useState('');  // Date state
    const [blogImages, setBlogImages] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // To handle submission state
    const navigate = useNavigate(); // For redirecting after success

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate form data
        if (!title || !author || !content || !blogDate) {
            setError('All fields are required');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('content', content);
        formData.append('blogDate', blogDate); // Adding the blogDate

        // Append images if any
        for (let i = 0; i < blogImages.length; i++) {
            formData.append('blogImages', blogImages[i]);
        }

        try {
            setIsSubmitting(true); // Disable form while submitting
            const response = await axios.post('http://localhost:8080/api/blog', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Redirect to the admin blog list page after successful creation
            navigate('/admin-blog');
        } catch (error) {
            setError('Error adding blog');
            setIsSubmitting(false);
        }
    };

    // Handle image selection
    const handleImageChange = (event) => {
        setBlogImages(event.target.files);
    };

    return (
        <div style={styles.adminContainer}>
            <h1>Add New Blog</h1>

            {/* Display error if there is one */}
            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Author:</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Content:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Blog Date:</label>
                    <input
                        type="date"
                        value={blogDate}
                        onChange={(e) => setBlogDate(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Images (optional):</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        style={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding Blog...' : 'Add Blog'}
                </button>
            </form>
        </div>
    );
};

// Inline styles
const styles = {
    adminContainer: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    form: {
        marginTop: '20px',
        width: '100%',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    textarea: {
        width: '100%',
        height: '150px',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '15px',
    },
};
