import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const BlogPage = () => {
    const [blogs, setBlogs] = useState([]); // State to store the list of blogs
    const [filteredBlogs, setFilteredBlogs] = useState([]); // State for filtered blogs based on date
    const [error, setError] = useState(null); // State for error handling
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [totalPages, setTotalPages] = useState(1); // Total number of pages for pagination
    const blogsPerPage = 5; // Number of blogs per page

    const navigate = useNavigate(); // Initialize useNavigate hook for navigation

    // Fetching all blogs from the backend
    const fetchBlogs = async () => {
        try {
            const response = await axios.get('https://be-pjhk4.onrender.com/api/blog'); // Adjust URL based on backend
            setBlogs(response.data);
            setFilteredBlogs(response.data); // Initially no filter, show all blogs
            setTotalPages(Math.ceil(response.data.length / blogsPerPage)); // Calculate total pages
        } catch (error) {
            setError('Error fetching blogs');
        }
    };

    // Filters blogs based on date
    const filterBlogsByDate = (filter) => {
        const currentDate = new Date();
        // Strip the time portion of the current date
        currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

        let filtered;

        // Helper function to compare dates ignoring time
        const isSameDay = (date1, date2) => {
            return (
                date1.getDate() === date2.getDate() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getFullYear() === date2.getFullYear()
            );
        };

        switch (filter) {
            case 'today':
                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    return isSameDay(blogDate, currentDate) && blogDate <= currentDate; // Only allow today or earlier blogs
                });
                break;

            case 'yesterday':
                const yesterday = new Date(currentDate);
                yesterday.setDate(currentDate.getDate() - 1); // Get yesterday's date
                yesterday.setHours(0, 0, 0, 0); // Strip time from yesterday

                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    return isSameDay(blogDate, yesterday) && blogDate <= currentDate; // Only allow yesterday or earlier blogs
                });
                break;

            case 'this-week':
                const startOfWeek = currentDate.getDate() - currentDate.getDay(); // Get start of the week (Sunday)
                const endOfWeek = startOfWeek + 6; // Get end of the week (Saturday)

                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    const blogDay = blogDate.getDate();
                    return blogDay >= startOfWeek && blogDay <= endOfWeek && blogDate <= currentDate; // Only allow dates <= today
                });
                break;

            case 'this-month':
                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    return blogDate.getMonth() === currentDate.getMonth() &&
                        blogDate.getFullYear() === currentDate.getFullYear() &&
                        blogDate <= currentDate; // Only allow dates <= today
                });
                break;

            case 'this-year':
                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    return blogDate.getFullYear() === currentDate.getFullYear() && blogDate <= currentDate; // Only allow dates <= today
                });
                break;

            default:
                filtered = blogs.filter((blog) => {
                    const blogDate = new Date(blog.blogDate);
                    blogDate.setHours(0, 0, 0, 0); // Strip time from blog date
                    return blogDate <= currentDate; // Filter out future blogs
                });
        }

        setFilteredBlogs(filtered);
        setCurrentPage(1); // Reset to first page after filter change
        setTotalPages(Math.ceil(filtered.length / blogsPerPage)); // Recalculate total pages
    };




    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Paginate the blogs based on current page
    const getPaginatedBlogs = () => {
        const startIndex = (currentPage - 1) * blogsPerPage;
        const endIndex = startIndex + blogsPerPage;
        return filteredBlogs.slice(startIndex, endIndex);
    };

    // Fetch blogs on component mount
    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleClick = (id) => {
        // Navigate to the blog details page, passing the blog ID
        navigate(`/blog/${id}`);
    };

    // Function to truncate content
    const truncateContent = (content, maxLength) => {
        if (content.length > maxLength) {
            return content.substring(0, maxLength) + '...';
        }
        return content;
    };

    if (error) {
        return <div>{error}</div>;
    }

    const paginatedBlogs = getPaginatedBlogs();

    return (
        <div style={styles.blogPage}>
            <h1>Blog List</h1>

            {/* Dropdown for Date Filters */}
            <div style={styles.blogFilters}>
                <select
                    style={styles.filterDropdown}
                    onChange={(e) => filterBlogsByDate(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="this-year">This Year</option>
                </select>
            </div>

            {/* Blog List */}
            {paginatedBlogs.length === 0 ? (
                <p>No blogs available.</p>
            ) : (
                <ul style={styles.blogList}>
                    {paginatedBlogs.map((blog) => (
                        <li
                            key={blog.id}
                            style={styles.blogListItem}
                            onClick={() => handleClick(blog.id)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
                            {/* Blog Image */}
                            <div style={styles.blogImageContainer}>
                                {/* Split the blogImage string into an array and get the first image */}
                                <img
                                    src={`https://be-pjhk4.onrender.com/api/blog/BlogImages/${blog.blogImage.split(',')[0]}`} // Get the first image from the list
                                    alt={blog.title}
                                    style={styles.blogImage}
                                />
                            </div>


                            {/* Blog Title, Author, Date */}
                            <div style={styles.blogTextContent}>
                                <h3 style={styles.blogTitle}>{blog.title}</h3>
                                <p style={styles.blogAuthor}>{blog.author}</p>
                                <p style={styles.blogDate}>
                                    {new Date(blog.blogDate).toLocaleDateString()}
                                </p>
                                <p style={styles.blogContent}>{truncateContent(blog.content, 100)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            <div style={styles.pagination}>
                {currentPage > 1 && (
                    <button
                        style={styles.paginationButton}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                )}
                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <button
                            key={pageNumber}
                            style={styles.paginationButton}
                            onClick={() => handlePageChange(pageNumber)}
                            className={currentPage === pageNumber ? 'active' : ''}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
                {currentPage < totalPages && <span style={styles.ellipsis}>...</span>}
                {currentPage < totalPages && (
                    <button
                        style={styles.paginationButton}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

// Inline styles
const styles = {
    blogPage: {
        paddingTop: '100px',
        width: '80%',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    blogList: {
        listStyle: 'none',
        padding: '0',
    },
    blogListItem: {
        borderBottom: '1px solid #ddd',
        padding: '15px 0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    blogImageContainer: {
        width: '150px',
        height: '100px',
        marginRight: '20px',
    },
    blogImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    blogTextContent: {
        flex: 1,
    },
    blogTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    blogAuthor: {
        color: '#555',
        fontSize: '1rem',
    },
    blogDate: {
        color: '#888',
        fontSize: '0.9rem',
        marginBottom: '10px',
    },
    blogContent: {
        fontSize: '1rem',
        color: '#333',
    },
    blogFilters: {
        marginBottom: '20px',
    },
    filterDropdown: {
        padding: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    pagination: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
    },
    paginationButton: {
        padding: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    ellipsis: {
        padding: '10px',
        cursor: 'default',
    },
};
