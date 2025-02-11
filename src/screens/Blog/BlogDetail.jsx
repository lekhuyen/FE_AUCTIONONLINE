import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';  // Use to get URL params

export const BlogDetail = () => {
    const { id } = useParams();  // Get the blog ID from the URL params
    const [blog, setBlog] = useState(null);  // State to store the selected blog
    const [recentPosts, setRecentPosts] = useState([]); // State for recent posts
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/blog/${id}`); // Adjust the URL based on your backend
                setBlog(response.data);  // Set the fetched blog in state
            } catch (error) {
                setError('Error fetching blog details');
            }
        };

        const fetchRecentPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/blog');  // Fetch recent blogs
                // Filter out the current blog from recent posts
                const filteredPosts = response.data.filter(post => post.id !== parseInt(id));
                setRecentPosts(filteredPosts.slice(0, 5));  // Get the 5 most recent posts, excluding the current one
            } catch (error) {
                setError('Error fetching recent posts');
            }
        };

        fetchBlogDetail();
        fetchRecentPosts();
    }, [id]);  // Fetch blog when the ID changes (i.e., when the user navigates to a different blog)

    if (error) {
        return <div>{error}</div>;
    }

    if (!blog) {
        return <div>Loading...</div>;
    }

    // Format the blog date
    const blogDate = new Date(blog.blogDate);
    const formattedDate = blogDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div style={styles.blogDetailContainer}>
            <div style={styles.mainContent}>
                {/* Main Image */}
                {blog.blogImage && (
                    <div style={styles.mainImageContainer}>
                        <img
                            src={`http://localhost:8080/api/blog/BlogImages/${blog.blogImage.split(',')[0]}`} // First image
                            alt="Main Blog Image"
                            style={styles.mainImage}
                        />
                    </div>
                )}

                {/* Blog Content */}
                <div style={styles.blogContentWrapper}>
                    <h1 style={styles.blogTitle}>{blog.title}</h1>

                    {/* Display date and author */}
                    <p style={styles.blogMeta}>
                        {formattedDate} by {blog.author}
                    </p>

                    <p style={styles.blogContent}>{blog.content}</p>

                    {/* Additional Images */}
                    {blog.blogImage && blog.blogImage.split(',').length > 1 && (
                        <div style={styles.additionalImagesContainer}>
                            <h4 style={styles.additionalImagesTitle}>More Images:</h4>
                            {blog.blogImage.split(',').slice(1).map((imageName, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:8080/api/blog/BlogImages/${imageName}`}
                                    alt={`Blog Image ${index + 1}`}
                                    style={styles.additionalImage}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Posts Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.recentPostsTitle}>Recent Posts</h2>
                <ul style={styles.recentPostsList}>
                    {recentPosts.map((post) => (
                        <li key={post.id} style={styles.recentPostItem}>
                            <a href={`/blog/${post.id}`} style={styles.recentPostLink}>
                                {/* Post Image */}
                                {post.blogImage && (
                                    <img
                                        src={`http://localhost:8080/api/blog/BlogImages/${post.blogImage.split(',')[0]}`}
                                        alt={`Image for ${post.title}`}
                                        style={styles.recentPostImage}
                                    />
                                )}

                                {/* Title and Date */}
                                <div>
                                    <h3 style={styles.recentPostTitle}>{post.title}</h3>
                                    <p style={styles.recentPostDate}>{new Date(post.blogDate).toLocaleDateString()}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Inline styles
const styles = {
    blogDetailContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        gap: '20px',
    },
    mainContent: {
        flex: 3,
    },
    sidebar: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    blogTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    blogMeta: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '20px',
    },
    mainImageContainer: {
        marginBottom: '20px',
        textAlign: 'center',
        width: '100%',
    },
    mainImage: {
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        borderRadius: '8px',
        maxHeight: '500px', // Ensure the image doesn't stretch too much
    },
    blogContentWrapper: {
        marginTop: '20px',
    },
    blogContent: {
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '20px',
        color: '#333',
    },
    additionalImagesContainer: {
        marginTop: '30px',
    },
    additionalImagesTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    additionalImage: {
        width: '100%',
        height: 'auto',
        maxWidth: '300px',
        marginRight: '15px',
        marginBottom: '15px',
        borderRadius: '5px',
    },
    recentPostsTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    recentPostsList: {
        listStyle: 'none',
        padding: '0',
    },
    recentPostItem: {
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    recentPostLink: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        color: '#333',
    },
    recentPostImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        marginRight: '10px',
        borderRadius: '8px',
    },
    recentPostTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    recentPostDate: {
        fontSize: '0.9rem',
        color: '#888',
    },
};
