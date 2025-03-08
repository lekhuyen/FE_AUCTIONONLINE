import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const AdminContact = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [contactsPerPage] = useState(5);
    const [filter, setFilter] = useState('all'); // Default to 'all'

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/contact');
                const sortedContacts = response.data.sort((a, b) => {
                    const timeA = new Date(a.receivetime[0], a.receivetime[1] - 1, a.receivetime[2], a.receivetime[3], a.receivetime[4], a.receivetime[5]);
                    const timeB = new Date(b.receivetime[0], b.receivetime[1] - 1, b.receivetime[2], b.receivetime[3], b.receivetime[4], b.receivetime[5]);
                    return timeB - timeA;
                });
                setContacts(sortedContacts);
                setFilteredContacts(sortedContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    useEffect(() => {
        // Filter contacts based on selected filter
        const filterContacts = () => {
            let filtered = [...contacts];
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));

            if (filter === 'today') {
                filtered = filtered.filter(contact => {
                    const contactDate = new Date(contact.receivetime[0], contact.receivetime[1] - 1, contact.receivetime[2], contact.receivetime[3], contact.receivetime[4], contact.receivetime[5]);
                    return contactDate >= startOfDay;
                });
            } else if (filter === 'month') {
                filtered = filtered.filter(contact => {
                    const contactDate = new Date(contact.receivetime[0], contact.receivetime[1] - 1, contact.receivetime[2], contact.receivetime[3], contact.receivetime[4], contact.receivetime[5]);
                    return contactDate >= startOfMonth;
                });
            } else if (filter === 'no-reply') {
                filtered = filtered.filter(contact => contact.replyMessage === "");
            }

            setFilteredContacts(filtered);
        };

        filterContacts();
    }, [filter, contacts]);

    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const parseDateArray = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 6) {
            return "Invalid Date";
        }
        const [year, month, day, hour, minute, second] = dateArray;
        const formattedDate = new Date(year, month - 1, day, hour, minute, second);
        if (isNaN(formattedDate.getTime())) {
            return "Invalid Date";
        }
        return formattedDate.toLocaleString();
    };

    const totalNotReplied = filteredContacts.filter(contact => contact.replyMessage === "").length;

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredContacts.length / contactsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Contact List</h2>

            {/* Filter Dropdown */}
            <div style={styles.filterContainer}>
                <select onChange={(e) => setFilter(e.target.value)} value={filter} style={styles.filterSelect}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="month">This Month</option>
                    <option value="no-reply">No Reply Yet</option> {/* Added new filter option */}
                </select>
                <span style={styles.filterLabel}>Filter by:</span>
            </div>

            {/* Count of contacts with no reply */}
            <div style={styles.notRepliedCount}>
                <p>{totalNotReplied} contacts have not been replied to.</p>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={styles.tableHeaderCell}>Id</th>
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
                            <td style={styles.tableCell}>{contact.id}</td>
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
        color: '#28a745',
    },
    filterContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    filterSelect: {
        padding: '8px 12px',
        fontSize: '16px',
        marginRight: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    filterLabel: {
        fontSize: '16px',
        color: '#333',
    },
    notRepliedCount: {
        marginBottom: '10px',
        fontSize: '16px',
        color: '#ff0000',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#28a745',
        color: '#fff',
        textAlign: 'left',
    },
    tableHeaderCell: {
        padding: '12px',
        fontSize: '16px',
        color: '#fff',
    },
    tableRow: {
        backgroundColor: '#fff',
        color: '#333',
        borderBottom: '1px solid #ddd',
    },
    tableCell: {
        padding: '12px',
        fontSize: '14px',
        borderBottom: '1px solid #ddd',
    },
    button: {
        padding: '8px 16px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '4px',
        textAlign: 'center',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    },
    pageButton: {
        width: '40px',
        height: '40px',
        border: '1px solid #28a745',
        padding: '0',
        margin: '0 5px',
        borderRadius: '50%',
        fontSize: '16px',
        lineHeight: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fff',
    },
};
