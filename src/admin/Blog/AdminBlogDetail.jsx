import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export const AdminBlogDetail = () => {
    const { id } = useParams();  // Extract the blog ID from the URL params
    const [blog, setBlog] = useState(null);  // State to store the selected blog details
    const [error, setError] = useState(null); // State for error handling
    const [newImages, setNewImages] = useState([]);  // State to store new images for the blog
    const navigate = useNavigate();  // Hook for navigation

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                const response = await axios.get(`https://be-pjhk4.onrender.com/api/blog/${id}`);
                setBlog(response.data);
            } catch (error) {
                setError('Error fetching blog details');
            }
        };

        fetchBlogDetail();
    }, [id]);

    // Handle image file selection
    const handleImageChange = (e) => {
        const files = e.target.files;
        setNewImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', blog.title);
        formData.append('author', blog.author);
        formData.append('content', blog.content);

        // Append selected new images to formData (if any)
        for (let i = 0; i < newImages.length; i++) {
            formData.append('blogImages', newImages[i]);
        }

        try {
            const response = await axios.put(`https://be-pjhk4.onrender.com/api/blog/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Blog updated successfully');
            navigate(-1); // Navigate back to the previous page
        } catch (error) {
            setError('Error updating blog');
        }
    };


    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    if (!blog) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.blogDetailContainer}>
            <button style={styles.backButton} onClick={() => navigate(-1)}>Return Back</button>
            <h1 style={styles.title}>{blog.title}</h1>
            <h3 style={styles.author}>
                {new Date(blog.blogDate).toLocaleDateString()} by {blog.author}
            </h3>

            <form onSubmit={handleSubmit}>
                <div style={styles.contentContainer}>
                    <p style={styles.content}>{blog.content}</p>

                    {/* New Title */}
                    <label htmlFor="title" style={styles.label}>Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={blog.title}
                        onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                        style={styles.input}
                    />

                    {/* New Author */}
                    <label htmlFor="author" style={styles.label}>Author:</label>
                    <input
                        type="text"
                        id="author"
                        value={blog.author}
                        onChange={(e) => setBlog({ ...blog, author: e.target.value })}
                        style={styles.input}
                    />

                    {/* New Content */}
                    <label htmlFor="content" style={styles.label}>Content:</label>
                    <textarea
                        id="content"
                        value={blog.content}
                        onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                        style={styles.textarea}
                    />

                    {/* Display current Blog Images */}
                    {blog.blogImage && (
                        <div style={styles.imageContainer}>
                            {blog.blogImage.split(',').map((imageName, index) => (
                                <img
                                    key={index}
                                    src={`https://be-pjhk4.onrender.com/api/blog/BlogImages/${imageName}`}
                                    alt={`Blog Image ${index + 1}`}
                                    style={styles.blogImage}
                                />
                            ))}
                        </div>
                    )}

                    {/* New Image Upload */}
                    <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        style={styles.fileInput}
                    />
                </div>

                <button type="submit" style={styles.submitButton}>Update Blog</button>
            </form>
        </div>
    );
};

// Inline styles for AdminBlogDetail
const styles = {
    blogDetailContainer: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '10px',
    },
    author: {
        fontSize: '1.1rem',
        color: '#555',
        marginBottom: '20px',
    },
    contentContainer: {
        marginBottom: '30px',
    },
    content: {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        color: '#444',
    },
    imageContainer: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'row', // Display images in a row
        gap: '10px',
        flexWrap: 'wrap',  // Ensure it wraps if there are many images
    },
    blogImage: {
        width: '30%', // Adjust size to fit multiple images
        height: 'auto',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
    },
    backButton: {
        padding: '10px 15px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
        fontSize: '1rem',
    },
    fileInput: {
        marginTop: '20px',
    },
    submitButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    label: {
        fontSize: '1rem',
        marginTop: '10px',
        display: 'block',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        minHeight: '100px',
    },
    error: {
        color: 'red',
        fontSize: '1.2rem',
    },
    loading: {
        fontSize: '1.2rem',
        color: '#777',
    },
};
