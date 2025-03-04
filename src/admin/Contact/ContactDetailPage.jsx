import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';  // Import FontAwesome icon
import { toast, ToastContainer } from 'react-toastify';  // Import react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import toast styles

export const ContactDetailPage = () => {
    const { id } = useParams(); // Get the contact ID from the URL
    const navigate = useNavigate(); // useNavigate hook to handle navigation
    const [contact, setContact] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for error handling

    useEffect(() => {
        const fetchContactDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/contact/${id}`);
                console.log('Received Contact:', response.data); // Log the received data
                setContact(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load contact details. Please try again later.');
                setLoading(false);
                console.error('Error fetching contact details:', error);
                toast.error('Error fetching contact details, please try again later.');  // Display error toast
            }
        };

        fetchContactDetails();
    }, [id]);

    const handleReplySubmit = async () => {
        const updatedContact = {
            ...contact,
            replyMessage,
            replyTime: new Date().toISOString(), // Set the current timestamp as the reply time
        };

        try {
            await axios.put(`http://localhost:8080/api/contact/${id}`, updatedContact);
            setContact(updatedContact); // Update the contact with the new reply time and message
            toast.success('Reply sent successfully!'); // Display success toast
            setReplyMessage(''); // Clear the reply message input
        } catch (error) {
            console.error('Error updating contact reply:', error);
            toast.error('Failed to send reply. Please try again later.');  // Display error toast
        }
    };

    const parseDateArray = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 6) {
            return "Invalid Date"; // Return invalid if the array is not as expected
        }

        const [year, month, day, hour, minute, second] = dateArray;
        // Month is 0-based, so subtract 1 from the month
        const formattedDate = new Date(year, month - 1, day, hour, minute, second);

        if (isNaN(formattedDate.getTime())) {
            return "Invalid Date"; // Handle invalid date
        }

        return formattedDate.toLocaleString(); // Format as needed
    };

    const handleReturnClick = () => {
        navigate('/admin-contact'); // Navigate back to the previous page (adjust the path as needed)
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>; // Display error if there's an issue fetching the data
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h2 style={styles.heading}>Contact Detail</h2>
                <p style={styles.receivedTime}>{parseDateArray(contact.receivetime)}</p>
            </div>

            <div style={styles.messageContainer}>
                <p><strong style={styles.bold}>Message:</strong> {contact.message}</p>
            </div>

            {/* Show reply form only if replyMessage is not set */}
            {contact.replyMessage === "" && (
                <div>
                    <div style={styles.replyContainer}>
                        <p style={styles.replyLabel}><strong>Reply Message:</strong></p>
                        <textarea
                            style={styles.textarea}
                            rows="4"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Enter your reply"
                        ></textarea>
                    </div>

                    <button
                        style={styles.replyButton}
                        onClick={handleReplySubmit}
                        disabled={!replyMessage.trim()} // Disable button if replyMessage is empty
                    >
                        Reply
                    </button>
                </div>
            )}

            {/* Show the sent reply message after submission */}
            {contact.replyMessage && (
                <div style={styles.sentReplyContainer}>
                    <p style={styles.replyLabel}><strong>Sent Reply:</strong></p>
                    <p>{contact.replyMessage}</p>
                </div>
            )}

            {/* Return Button */}
            <button style={styles.returnButton} onClick={handleReturnClick}>
                <FaArrowLeft style={styles.returnIcon} /> Return
            </button>

            {/* Toast Container for displaying toasts */}
            <ToastContainer />
        </div>
    );
};

// Styles object
const styles = {
    container: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: 'auto',
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    heading: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#28a745', // Green color for the heading
        margin: '0',
    },
    receivedTime: {
        fontSize: '16px',
        color: '#6c757d', // Lighter grey for the received time
        textAlign: 'right',
        margin: '0',
    },
    messageContainer: {
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
    replyContainer: {
        marginBottom: '20px',
    },
    replyLabel: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '16px',
        minHeight: '120px',
        resize: 'vertical',
        backgroundColor: '#f9f9f9',
    },
    replyButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '12px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.3s',
    },
    replyButtonHover: {
        backgroundColor: '#218838',
    },
    sentReplyContainer: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f1f1f1',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    returnButton: {
        backgroundColor: '#f8f9fa',
        color: '#007bff',
        padding: '12px 20px',
        fontSize: '16px',
        border: '1px solid #007bff',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        marginTop: '20px',
    },
    returnIcon: {
        marginRight: '8px',
    },
};
