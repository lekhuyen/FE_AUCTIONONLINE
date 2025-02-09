import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export const ContactDetailPage = () => {
    const { id } = useParams(); // Get the contact ID from the URL
    const navigate = useNavigate(); // useNavigate hook to handle navigation
    const [contact, setContact] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/contact/${id}`);
                console.log('Received Contact:', response.data); // Log the received data
                setContact(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching contact details:', error);
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
            alert('Reply sent successfully!');
            navigate('/adminContact'); // Redirect to the admin page after replying
        } catch (error) {
            console.error('Error updating contact reply:', error);
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

    if (loading) {
        return <div>Loading...</div>;
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
            >
                Reply
            </button>
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
};
