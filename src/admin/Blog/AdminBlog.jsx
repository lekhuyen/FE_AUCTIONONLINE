import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // For navigation to detail and add pages

export const AdminBlog = () => {
    const [blogs, setBlogs] = useState([]);  // State to store blog data
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/blog');  // Replace with actual API endpoint
                setBlogs(response.data);  // Set blogs into state
            } catch (error) {
                setError('Error fetching blog data');
            }
        };

        fetchBlogs();
    }, []);  // Fetch blogs on component mount

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/blog/${id}`);  // Adjust the URL based on your backend
            setBlogs(blogs.filter((blog) => blog.id !== id));  // Remove deleted blog from state
        } catch (error) {
            setError('Error deleting blog');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={styles.adminContainer}>
            <h1>Admin - Blog Management</h1>

            {/* Add Blog Button */}
            <Link to="/admin-blog/add" style={styles.addButton}>
                Add Blog
            </Link>

            {/* Blog Table */}
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.tableHeader}>ID</th>
                    <th style={styles.tableHeader}>Title</th>
                    <th style={styles.tableHeader}>Author</th>
                    <th style={styles.tableHeader}>Blog Date</th>
                    <th style={styles.tableHeader}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {blogs.map((blog, index) => (
                    <tr key={blog.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.tableCell}>{blog.id}</td>
                        <td style={styles.tableCell}>{blog.title}</td>
                        <td style={styles.tableCell}>{blog.author}</td>
                        <td style={styles.tableCell}>{new Date(blog.blogDate).toLocaleDateString()}</td>
                        <td style={styles.tableCell}>
                            {/* Detail Button */}
                            <Link to={`/admin-blog/detail/${blog.id}`} style={styles.button}>
                                Detail
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(blog.id)}
                                style={styles.deleteButton}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// Inline styles
const styles = {
    adminContainer: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    addButton: {
        marginBottom: '20px',
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        display: 'inline-block',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    addButtonHover: {
        backgroundColor: '#45a049',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    tableHeader: {
        backgroundColor: '#4CAF50',
        color: 'white',
        fontWeight: 'bold',
        padding: '12px 15px',
        textAlign: 'left',
    },
    tableCell: {
        padding: '10px 15px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
    evenRow: {
        backgroundColor: '#f9f9f9',
    },
    oddRow: {
        backgroundColor: '#ffffff',
    },
    button: {
        margin: '0 10px',
        padding: '6px 12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    },
    buttonHover: {
        backgroundColor: '#45a049',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    deleteButtonHover: {
        backgroundColor: '#e53935',
    },
};

