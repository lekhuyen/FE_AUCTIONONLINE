import React, { useState, useEffect } from 'react';  // Import useState and useEffect hooks from React
import axios from 'axios';  // Import axios for making HTTP requests

// Main title component
const AboutUsMainTitle = ({ title }) => (
    <div style={styles.container}>
        <h1 style={styles.title}>{title}</h1>
    </div>
);

// Description component
const AboutUsDescription = ({ description }) => (
    <div style={styles.descriptionContainer}>
        <p style={styles.descriptionText}>{description}</p>
    </div>
);

const AboutUsCard = ({ title, description, aboutCardImage }) => {
    return (
        <div style={styles.card}>
            <img
                src={`http://localhost:8080/api/aboutuscard/AboutUsImages/${aboutCardImage}`}  // Adjusting image URL path
                alt={title}
                style={styles.image}
            />
            <div style={styles.body}>
                <h3 style={styles.cardTitle}>{title}</h3>
                <p style={styles.bodyText}>{description}</p>
            </div>
        </div>
    );
};

// Accordion Item for FAQ section
const AccordionItem = ({ title, content }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={accordionStyles.container}>
            <div onClick={toggleAccordion} style={accordionStyles.title}>
                <span>{title}</span>
                <img
                    src={isOpen
                        ? 'https://fonts.gstatic.com/s/i/materialiconsoutlined/keyboard_arrow_down/v7/24px.svg'  // Downward arrow when open
                        : 'https://fonts.gstatic.com/s/i/materialiconsoutlined/keyboard_arrow_up/v7/24px.svg'}  // Upward arrow when closed
                    alt="Toggle"
                    width="20"
                    height="20"
                />
            </div>
            {isOpen && (
                <div style={accordionStyles.content}>
                    {content}
                </div>
            )}
        </div>
    );
};

// AboutUsComponents to render the whole About Us section
export const AboutUsComponents = () => {

    const [aboutUsData, setAboutUsData] = useState(null);
    const [aboutUsCardData, setAboutUsCardData] = useState([]);

    useEffect(() => {
        // Fetch About Us data from the backend
        axios.get('http://localhost:8080/api/aboutus')
            .then((response) => {
                setAboutUsData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching About Us data", error);
            });
    }, []);

    useEffect(() => {
        // Fetch About Us Card data from the backend
        axios.get('http://localhost:8080/api/aboutuscard')
            .then((response) => {
                setAboutUsCardData(response.data);  // Set About Us Card data to state
            })
            .catch((error) => {
                console.error("Error fetching About Us Card data", error);
            });
    }, []);

    // Check if data is still loading
    if (!aboutUsData) {
        return <div>Loading...</div>;
    }

    return (
        <div style={pageStyles.container}>
            {/* Render dynamic content */}
            <AboutUsMainTitle title={aboutUsData[0]?.title}/>
            <AboutUsDescription description={aboutUsData[0]?.description}/>

            <div style={pageStyles.imageRow}>
                {aboutUsData[0]?.aboutImage1 && (
                    <img
                        src={`http://localhost:8080/api/aboutus/AboutUsImages/${aboutUsData[0]?.aboutImage1}`} // Backend image path
                        alt="About Us Image 1"
                        style={pageStyles.image}
                    />
                )}
                {aboutUsData[0]?.aboutImage2 && (
                    <img
                        src={`http://localhost:8080/api/aboutus/AboutUsImages/${aboutUsData[0]?.aboutImage2}`} // Backend image path
                        alt="About Us Image 2"
                        style={pageStyles.image}
                    />
                )}
            </div>

            <h2 style={pageStyles.subheading}>Why Choose Us?</h2>
            <div style={pageStyles.cardRow}>
                {aboutUsCardData.map((card, index) => (
                    <AboutUsCard
                        key={index}
                        title={card.title}
                        description={card.description}
                        aboutCardImage={card.aboutCardImage}
                    />
                ))}
            </div>

            <div style={pageStyles.accordionSection}>
                <AccordionItem title="What types of auctions can I participate in?"
                               content="We offer a wide variety of auctions, from collectibles to electronics, and much more!"/>
                <AccordionItem title="How can I place a bid?"
                               content="Bidding is easy! Simply sign up, browse auctions, and place your bid on any item you're interested in."/>
                <AccordionItem title="Is my payment information secure?"
                               content="Yes! We use top-tier security measures to ensure all your personal and payment details are kept safe."/>
            </div>
        </div>
    );
};

// Styling
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '230px',
        backgroundColor: '#f5f5f5',
    },
    descriptionContainer: {
        alignItems: 'center',
        paddingLeft: '200px',
        paddingRight: '200px',
        paddingBottom: '50px',
    },
    descriptionText: {
        fontSize: '1.2rem',
        color: '#555',
        lineHeight: '1.6',
    },
    title: {
        fontSize: '72px',
        fontWeight: 700,
        color: '#1e1e1e',
        letterSpacing: '-2.16px',
        textAlign: 'center',
        lineHeight: '120%',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    image: {
        width: '160px',
        height: '160px',
        marginBottom: '24px',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    bodyText: {
        fontSize: '16px',
        fontWeight: 400,
        color: '#757575',
        lineHeight: '140%',
    },
    cardTitle: {
        fontSize: '24px',  // Smaller font size for the card title
        fontWeight: 600,   // Medium font weight
        color: '#1e1e1e',
        textAlign: 'center',
        marginBottom: '16px',
    },
};

const accordionStyles = {
    container: {
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        marginBottom: '8px',
        backgroundColor: '#ffffff',
        padding: '16px',
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '140%',
        color: '#1e1e1e',
    },
    content: {
        paddingTop: '16px',
        fontSize: '16px',
        lineHeight: '140%',
        color: '#1e1e1e',
    },
};

const pageStyles = {
    container: {
        padding: '32px',
        backgroundColor: '#f5f5f5',
    },
    imageRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        marginBottom: '64px',
    },
    image: {
        width: '300px',
        height: '200px',
        backgroundColor: '#e0e0e0',
    },
    subheading: {
        fontSize: '36px',
        fontWeight: 700,
        color: '#1e1e1e',
        textAlign: 'center',
        marginBottom: '32px',
    },
    cardRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',  // Ensures 3 cards per row
        gap: '32px',
        marginBottom: '32px',
    },
    accordionSection: {
        marginTop: '32px',
    },
};
