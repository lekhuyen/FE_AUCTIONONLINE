
import clothingImage from '../Contact/Images/clothing.jpg';
import artImage from '../Contact/Images/art_with_frame.jpg';
import bookImage from '../Contact/Images/book.jpg';
import electronicImage from '../Contact/Images/computer_about_us.jpg';
import bellImage from '../Contact/Images/bell_icon.png';
import appStoreImage from '../Contact/Images/download_the_app_store.png';
import newLogo from '../Contact/Images/new_logo.jpg';
import abcLogo from '../Contact/Images/abc_logo.png';
import cnnLogo from '../Contact/Images/Cnn_logo.png';
import nbcLogo from '../Contact/Images/NBC_logo.jpg';
import foxLogo from '../Contact/Images/Fox_image_logo.jpg';
import { useState, useEffect } from 'react';

export const AboutUsComponents = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mainContainerStyle = {
        padding: '40px 20px',
        maxWidth: '1800px',
        margin: '0 auto',
    };

    // About Biddora Section
    const aboutUsMainStyle = {
        marginBottom: '60px',
        marginTop: '120px',
        backgroundColor: '#f9f9f9',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    };

    const aboutTitleStyle = {
        textAlign: 'center',
        fontSize: windowWidth < 768 ? '2rem' : '3rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    };

    const descriptionStyle = {
        fontSize: '26px',
        lineHeight: '1.8',
        textAlign: 'justify',
        color: '#555',
        marginBottom: '30px',
        fontFamily: "'Roboto', sans-serif",
    };

    // Staff Curated Collections Section
    const staffCuratedStyle = {
        marginBottom: '60px',
    };

    const staffTitleStyle = {
        textAlign: 'center',
        fontSize: windowWidth < 768 ? '2rem' : '2.5rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
    };

    const collectionsContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
    };

    const collectionItemStyle = {
        textAlign: 'center',
        maxWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
    };

    const collectionImageStyle = {
        width: '100%',
        height: '250px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    };

    const collectionTitleStyle = {
        marginTop: '15px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#333',
    };

    // Get Notifications Section
    const notificationContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '40px',
        width: '100%',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#f1f1f1',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    };

    const notificationTextStyle = {
        textAlign: 'center',
        flex: 2,
    };

    const notificationImageStyle = {
        width: '100%',
        height: 'auto',
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    };

    const notificationTextTitle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
    };

    // As Seen On Section
    const asSeenOnStyle = {
        marginTop: '60px',
        marginBottom: '60px',
    };

    const logosContainerStyle = {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        marginTop: '20px',
    };

    const logoItemStyle = {
        width: '220px',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
    };

    const phoneImageStyle = {
        flex: 1,
        maxWidth: '250px',
    };

    return (
        <div style={mainContainerStyle}>
            <div style={aboutUsMainStyle}>
                <h1 style={aboutTitleStyle}>About Biddora</h1>
                <p style={descriptionStyle}>
                    Biddora brings an international audience of millions to the heart of the bidding action in Art, antiques, Jewelry, and Collectibles auctions across the globe.
                    <br />
                    With fascinating objects up for bid in more than 50 countries—instantly translated to your language and currency—Biddora is a worldwide marketplace with treasures waiting to be discovered, whether you're an avid collector or first-time visitor.
                    <br />
                    By hosting thousands of auctions in real-time via the Internet, the site allows unprecedented access to remote sales, and savvy bidders can often land desired items at very desirable prices. Leave an absentee bid, or fully engage in the live-auction action—it's up to you. All bidding takes place via a secure bidder network, which keeps your maximum bids for upcoming sales private until the item is opened on the day of the sale.
                    <br />
                    Biddora revolutionized the industry from the start. In 2002, the NYC-based company formed a marketing partnership with eBay to introduce eBay Live Auctions. This alliance of Biddora and eBay enabled auction houses worldwide to go online with their live sales—a development that changed the auction business forever. In 2009, the debut of Biddora' iPhone and Android apps, with live-bidding capabilities, opened up a new mobile pipeline to bid anytime, from anywhere, with complete anonymity.
                    <br />
                    Since then, Biddora has been the first to engage bidders with live streaming video, easy online payments, personalized search alerts, and more.
                    <br />
                    Now in its second decade, Biddora is the Web's leading auction-related site, with millions of qualified bidders. Biddora also provides a constant stream of industry intelligence to auctioneers, collectors, museums, appraisers, consignors, and more via:
                    <br />
                    The easy-to-use Auction Results Database, a vast database with more than 29 million results that offers keyword-search access to verified auction outcomes, recent to historical. The updated archive is the #1 free online resource for the trade, appraisers, collectors, designers, art institutions, estate officers, journalists, students, and others on the research trail;
                    <br />
                    The Biddora Consignment Hub, an easy way for interested consignors to share their property for review and evaluation with thousands of auction houses in one spot.
                    <br />
                    There are many ways to get started as a collector. You can browse curated auctions, find auctions near you, set up keyword search alerts, search, bid, and win.
                </p>

            </div>

            <div style={staffCuratedStyle}>
                <h1 style={staffTitleStyle}>Staff Curated Collections</h1>
                <div style={collectionsContainerStyle}>
                    <div
                        style={collectionItemStyle}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <img src={artImage} alt="Art" style={collectionImageStyle} />
                        <h3 style={collectionTitleStyle}>Art</h3>
                    </div>
                    <div
                        style={collectionItemStyle}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <img src={clothingImage} alt="Clothing" style={collectionImageStyle} />
                        <h3 style={collectionTitleStyle}>Clothing</h3>
                    </div>
                    <div
                        style={collectionItemStyle}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <img src={bookImage} alt="Book" style={collectionImageStyle} />
                        <h3 style={collectionTitleStyle}>Book</h3>
                    </div>
                    <div
                        style={collectionItemStyle}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <img src={electronicImage} alt="Electronic" style={collectionImageStyle} />
                        <h3 style={collectionTitleStyle}>Electronic</h3>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
                <div style={notificationContainerStyle}>
                    <div style={phoneImageStyle}>
                        <img src={bellImage} alt="Phone" style={notificationImageStyle} />
                    </div>
                    <div style={notificationTextStyle}>
                        <h1 style={notificationTextTitle}>Get notifications from your favorite auctioneers</h1>
                    </div>
                    <div style={phoneImageStyle}>
                        <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                            <img src={appStoreImage} alt="Download on the App Store" style={notificationImageStyle} />
                        </a>
                    </div>
                </div>
            </div>

            <div style={asSeenOnStyle}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>As Seen On</h1>
                <div style={logosContainerStyle}>
                    <div style={logoItemStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} >
                        <img src={newLogo} alt="New" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                    <div style={logoItemStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} >
                        <img src={abcLogo} alt="ABC" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                    <div style={logoItemStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} >
                        <img src={cnnLogo} alt="CNN" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                    <div style={logoItemStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} >
                        <img src={nbcLogo} alt="NBC" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                    <div style={logoItemStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} >
                        <img src={foxLogo} alt="Fox" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};



