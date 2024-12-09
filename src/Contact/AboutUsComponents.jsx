import React from 'react';

const AboutUsMainTitle = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>About Us</h1>
        </div>
    );
};

// AboutUsDescription Component (the new component for the description)
const AboutUsDescription = () => {
    return (
        <div style={styles.descriptionContainer}>
            <p style={styles.descriptionText}>
                We are a passionate team committed to providing exceptional services and delivering results that exceed expectations. Our mission is to innovate, inspire, and make a lasting impact through our work.
            </p>
        </div>
    );
};


const AboutUsCard = () => {
    return (
        <div style={styles.card}>
            <img
                src="https://dashboard.codeparrot.ai/api/assets/Z1adTowTRzcMVVyT"
                alt="Placeholder"
                style={styles.image}
            />
            <div style={styles.body}>
                <h2 style={styles.title}>Title</h2>
                <p style={styles.bodyText}>
                    Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.
                </p>
            </div>
        </div>
    );
};

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
                    src={isOpen ? 'https://dashboard.codeparrot.ai/api/assets/Z1adTowTRzcMVVyU' : 'https://dashboard.codeparrot.ai/api/assets/Z1adTowTRzcMVVyV'}
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

export const AboutUsComponents = () => {
    return (
        <div style={pageStyles.container}>
            <AboutUsMainTitle />

            <AboutUsDescription />

            <div style={pageStyles.imageRow}>
                <img src="https://dashboard.codeparrot.ai/api/assets/Z1adTowTRzcMVVyW" alt="Placeholder" style={pageStyles.image} />
                <img src="https://dashboard.codeparrot.ai/api/assets/Z1adTowTRzcMVVyX" alt="Placeholder" style={pageStyles.image} />
            </div>

            <h2 style={pageStyles.subheading}>Why Choose Us?</h2>
            <div style={pageStyles.cardRow}>
                <AboutUsCard />
                <AboutUsCard />
                <AboutUsCard />
            </div>
            <div style={pageStyles.cardRow}>
                <AboutUsCard />
                <AboutUsCard />
                <AboutUsCard />
            </div>
            <div style={pageStyles.accordionSection}>
                <AccordionItem title="Title" content="Answer the frequently asked question in a simple sentence, a longish paragraph, or even in a list." />
                <AccordionItem title="Title" content="" />
                <AccordionItem title="Title" content="" />
                <AccordionItem title="Title" content="" />
                <AccordionItem title="Title" content="" />
            </div>
        </div>
    );
};

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
        paddingBottom: '50px'
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
        maxWidth: '325px',
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
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        marginBottom: '32px',
    },
    accordionSection: {
        marginTop: '32px',
    },
};

