import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Contact = () => {
    const [countryCodes, setCountryCodes] = useState([]);
    const [interestedInOptions, setInterestedInOptions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '',
        interestedIn: '',
        message: ''
    });
    const [loadingCountryCodes, setLoadingCountryCodes] = useState(true);
    const [loadingInterestedInOptions, setLoadingInterestedInOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Fetch country codes and interested in options from the API
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [countryCodesResponse, interestedInResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/contact/countryCodes'),
                    axios.get('http://localhost:8080/api/contact/interestedInOptions')
                ]);

                const countryData = countryCodesResponse.data.map((code) => ({
                    name: code,
                    phoneCode: getCountryPhoneCode(code)
                }));

                setCountryCodes(countryData);
                setInterestedInOptions(interestedInResponse.data);

                setFormData((prevState) => ({
                    ...prevState,
                    countryCode: countryData.length > 0 ? countryData[0].name : '',  // Set the first country code
                    interestedIn: interestedInResponse.data.length > 0 ? interestedInResponse.data[0] : ''  // Set the first interested option
                }));

                setLoadingCountryCodes(false);
                setLoadingInterestedInOptions(false);
            } catch (error) {
                setFormError('Error fetching options. Please try again later.');
                console.error('Error fetching options:', error);
            }
        };

        fetchOptions();
    }, []);

    // Function to map country name to phone code
    const getCountryPhoneCode = (country) => {
        const countryCodeMap = {
            US: "+1",
            UK: "+44",
            INDIA: "+91"
        };
        return countryCodeMap[country] || "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validatePhone = (phone) => {
        const regex = /^[0-9]{10}$/; // Assuming 10 digit phone numbers
        return regex.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if a valid country code is selected
        if (!formData.countryCode || formData.countryCode === '') {
            setFormError('Please select a valid country code.');
            return;
        }

        // Validate the phone number
        if (!validatePhone(formData.phone)) {
            setFormError('Please enter a valid 10-digit phone number.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');
        try {
            const response = await axios.post('http://localhost:8080/api/contact', formData);
            setFormSubmitted(true);
        } catch (error) {
            // Handle specific error codes
            if (error.response) {
                if (error.response.status === 401) {
                    setFormError('Unauthorized request. Please log in and try again.');
                } else if (error.response.status === 400) {
                    setFormError('Bad request. Please check your inputs.');
                } else {
                    setFormError('There was an error submitting the form. Please try again.');
                }
            } else {
                setFormError('Network error. Please try again later.');
            }
            console.error('Error sending contact:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOkClick = () => {
        // Reset the form and reload the page
        setFormSubmitted(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            countryCode: '',
            interestedIn: '',
            message: ''
        });
        setFormError('');
        window.location.reload();  // Reload the page to reset everything
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Contact Us</h1>
            {!formSubmitted ? (
                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label} htmlFor="name">Contact Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label} htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label} htmlFor="countryCode">Select Phone Number</label>
                            <div style={styles.phoneInputWrapper}>
                                <select
                                    name="countryCode"
                                    id="countryCode"
                                    value={formData.countryCode || (countryCodes.length > 0 ? countryCodes[0].name : '')}
                                    onChange={handleChange}
                                    required
                                    style={styles.countryCodeSelect}
                                >
                                    <option value="" disabled>Select Phone Number</option>
                                    {loadingCountryCodes ? (
                                        <option>Loading...</option>
                                    ) : (
                                        countryCodes.map((country) => (
                                            <option key={country.name} value={country.name}>
                                                {`${country.name} (${country.phoneCode})`}
                                            </option>
                                        ))
                                    )}
                                </select>

                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    required
                                    style={styles.phoneInput}
                                />
                            </div>
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label} htmlFor="interestedIn">Interested In</label>
                            <select
                                name="interestedIn"
                                id="interestedIn"
                                value={formData.interestedIn || (interestedInOptions.length > 0 ? interestedInOptions[0] : '')}
                                onChange={handleChange}
                                required
                                style={styles.select}
                            >
                                <option value="" disabled>Select Interested In</option>
                                {loadingInterestedInOptions ? (
                                    <option>Loading...</option>
                                ) : (
                                    interestedInOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="message">Message</label>
                        <textarea
                            name="message"
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your Message"
                            required
                            style={styles.textarea}
                            maxLength={500}  // Limit to 500 characters
                        />
                        <div style={styles.characterCount}>
                            <span>{formData.message.length}/500 characters</span>
                        </div>
                    </div>
                    {formError && <p style={styles.error}>{formError}</p>}
                    <button type="submit" style={styles.button} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Contact Name'}
                    </button>
                </form>
            ) : (
                <div style={styles.thankYouBox}>
                    <h2 style={styles.thankYouHeading}>Thank you for contacting us!</h2>
                    <p style={styles.message}>We will get back to you soon.</p>
                    <button onClick={handleOkClick} style={styles.okButton}>OK</button>
                </div>
            )}
            <div style={mapStyles.container}>
                <div style={mapStyles.mapContainer}>
                    <iframe
                        src="https://maps.app.goo.gl/zowaSd1f92o8UdTt7"
                        width="100%"
                        height="100%"
                        style={mapStyles.map}
                        frameBorder="0"
                        allowFullScreen
                        title="Google Map"
                    ></iframe>
                </div>
                <div style={mapStyles.infoContainer}>
                    <h2 style={mapStyles.heading}>Contact Information</h2>
                    <p style={mapStyles.infoText}><strong>Location:</strong> 123 Example St, City, Country</p>
                    <p style={mapStyles.infoText}><strong>Phone:</strong> +1 (123) 456-7890</p>
                    <p style={mapStyles.infoText}><strong>Email:</strong> example@example.com</p>
                    <div style={mapStyles.socialLinks}>
                        <a href="https://facebook.com" style={mapStyles.socialLink} target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://google.com" style={mapStyles.socialLink} target="_blank" rel="noopener noreferrer">Google</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Updated styles for character count display
const styles = {
    container: {
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heading: {
        fontSize: '36px',
        fontWeight: 700,
        color: '#1e1e1e',
        textAlign: 'center',
        marginBottom: '32px',
    },
    form: {
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '8px',  // Keep border-radius to smooth edges, but remove the box-shadow
        marginBottom: '32px',  // Adding space between form and map
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '16px',
    },
    col: {
        flex: '1',
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '8px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',  // Change to a softer border color or remove completely
        borderRadius: '4px',
        marginBottom: '16px',
    },
    select: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',  // Change to a softer border color or remove completely
        borderRadius: '4px',
        marginBottom: '16px',
    },
    phoneInputWrapper: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    countryCodeSelect: {
        width: '120px',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',  // Change to a softer border color or remove completely
        borderRadius: '4px',
    },
    phoneInput: {
        flex: '1',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',  // Change to a softer border color or remove completely
        borderRadius: '4px',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',  // Change to a softer border color or remove completely
        borderRadius: '4px',
        marginBottom: '16px',
        minHeight: '100px',
    },
    button: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '12px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '16px',
    },
    thankYouBox: {
        backgroundColor: '#f0f8ff',
        padding: '24px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',  // Remove shadow if needed
    },
    thankYouHeading: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#28a745',
    },
    message: {
        fontSize: '18px',
        color: '#28a745',
    },
    okButton: {
        marginTop: '16px',
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    characterCount: {
        fontSize: '14px',
        color: '#666',
        marginTop: '8px',
        textAlign: 'right',
    },
};

// Styles for the ContactMap component
const mapStyles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '60vh', // Adjust this value as per the design requirements
        border: '2px solid #ccc',  // Add a border to the map container
        borderRadius: '8px',  // Optional: slightly round the corners of the map container
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',  // Optional: adds subtle shadow for better separation
    },
    mapContainer: {
        width: '60%',
        height: '100%',
    },
    map: {
        width: '100%',
        height: '100%',
        border: 'none',  // Ensure no border on the iframe itself
    },
    infoContainer: {
        width: '40%',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    heading: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '20px',
    },
    infoText: {
        fontSize: '16px',
        color: '#333',
        marginBottom: '10px',
    },
    socialLinks: {
        marginTop: '20px',
    },
    socialLink: {
        fontSize: '16px',
        color: '#007bff',
        textDecoration: 'none',
        marginRight: '15px',
    },
};

