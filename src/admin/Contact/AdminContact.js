import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const AdminContact = () => {
    const [contacts, setContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [contactsPerPage] = useState(5); // Show 5 contacts per page

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/contact');
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    // Get current contacts to display based on the current page
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);

    // Function to handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to parse the date array
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

    // Total pages based on contacts and contacts per page
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(contacts.length / contactsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Contact List</h2>
            <table style={styles.table}>
                <thead>
                <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Phone</th>
                    <th style={styles.tableHeaderCell}>Country Code</th>
                    <th style={styles.tableHeaderCell}>Interested In</th>
                    <th style={styles.tableHeaderCell}>Receive Time</th>
                    <th style={styles.tableHeaderCell}>Reply Time</th>
                    <th style={styles.tableHeaderCell}>Detail</th>
                </tr>
                </thead>
                <tbody>
                {currentContacts.map((contact) => (
                    <tr key={contact.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{contact.name}</td>
                        <td style={styles.tableCell}>{contact.email}</td>
                        <td style={styles.tableCell}>{contact.phone}</td>
                        <td style={styles.tableCell}>{contact.formattedCountryCode}</td>
                        <td style={styles.tableCell}>{contact.interestedIn}</td>
                        <td style={styles.tableCell}>{parseDateArray(contact.receivetime)}</td>
                        <td style={styles.tableCell}>
                            {contact.replyMessage === "" ? "Not Reply" : parseDateArray(contact.replyTime)}
                        </td>
                        <td style={styles.tableCell}>
                            <Link to={`/adminContact/${contact.id}`} style={styles.button}>Detail</Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={styles.pagination}>
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        style={{
                            ...styles.pageButton,
                            backgroundColor: currentPage === number ? '#28a745' : '#fff',
                            color: currentPage === number ? '#fff' : '#28a745',
                        }}
                    >
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Styles object
const styles = {
    container: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    heading: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#28a745', // Green color for the heading
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: '#f8f9fa', // Light grey background
    },
    tableHeader: {
        backgroundColor: '#28a745', // Green background for header
        color: '#fff',
        textAlign: 'left',
    },
    tableHeaderCell: {
        padding: '12px',
        fontSize: '16px',
        color: '#fff', // White text color for header
    },
    tableRow: {
        backgroundColor: '#ffffff', // White background for rows
        color: '#333',
        borderBottom: '1px solid #ddd', // Light grey border for row separation
    },
    tableCell: {
        padding: '12px',
        fontSize: '14px',
        borderBottom: '1px solid #ddd', // Light grey border
    },
    button: {
        padding: '8px 16px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '4px',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'inline-block',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    },
    pageButton: {
        width: '40px',  // Fixed width
        height: '40px', // Fixed height to ensure it's circular
        border: '1px solid #28a745',
        padding: '0', // Remove internal padding to ensure circle shape
        margin: '0 5px',
        borderRadius: '50%',
        fontSize: '16px',
        lineHeight: '40px', // Center the number vertically
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'background-color 0.3s, color 0.3s',
    },
};

