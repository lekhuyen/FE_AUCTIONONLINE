import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Modal,
    TextareaAutosize,
    TextField,
    Typography
} from "@mui/material";
import { DeleteForever, Edit } from "@mui/icons-material";



export const AdminAboutUs = () => {
    const [isFirstSectionOpen, setIsFirstSectionOpen] = useState(false);
    const [isSecondSectionOpen, setIsSecondSectionOpen] = useState(false);

    const toggleFirstSection = () => setIsFirstSectionOpen(!isFirstSectionOpen);
    const toggleSecondSection = () => setIsSecondSectionOpen(!isSecondSectionOpen);

    return (
        <div>
            {/* Accordion for AdminAboutUsfirst */}
            <div style={aboutusaccordionstyles.toggleButtonContainer}>
                <button
                    onClick={toggleFirstSection}
                    style={aboutusaccordionstyles.toggleButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = aboutusaccordionstyles.toggleButtonHover.backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                    {isFirstSectionOpen ? "Collapse AdminAboutUsfirst" : "Expand AdminAboutUsfirst"}
                    <span
                        style={{
                            ...aboutusaccordionstyles.toggleButtonIcon,
                            transform: isFirstSectionOpen ? 'rotate(90deg)' : 'rotate(0)'
                        }}
                    >
                        {' →'}
                    </span>
                </button>
            </div>
            {isFirstSectionOpen && (
                <div style={aboutusaccordionstyles.cardContainer}>
                    <AdminAboutUsfirst />
                </div>
            )}

            {/* Accordion for AdminAboutUsCard */}
            <div style={aboutusaccordionstyles.toggleButtonContainer}>
                <button
                    onClick={toggleSecondSection}
                    style={aboutusaccordionstyles.toggleButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = aboutusaccordionstyles.toggleButtonHover.backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                >
                    {isSecondSectionOpen ? "Collapse AdminAboutUsCard" : "Expand AdminAboutUsCard"}
                    <span
                        style={{
                            ...aboutusaccordionstyles.toggleButtonIcon,
                            transform: isSecondSectionOpen ? 'rotate(90deg)' : 'rotate(0)'
                        }}
                    >
                        {' →'}
                    </span>
                </button>
            </div>
            {isSecondSectionOpen && (
                <div style={aboutusaccordionstyles.cardContainer}>
                    <AdminAboutUsCard />
                </div>
            )}
        </div>
    );
}


const AdminAboutUsfirst = () => {
    const [aboutUsData, setAboutUsData] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        axios.get('https://be-pjhk4.onrender.com/api/aboutus')
            .then((response) => {
                if (response.data && response.data.length > 0) {
                    const data = response.data[0];
                    setAboutUsData(data);
                    setTitle(data.title);
                    setDescription(data.description);
                    setImage1(data.aboutImage1);
                    setImage2(data.aboutImage2);
                    setIsEditMode(true);
                } else {
                    setIsEditMode(false);
                    setAboutUsData({});
                }
            })
            .catch((error) => {
                console.error("Error fetching About Us data", error);
                setIsEditMode(false);
                setAboutUsData({});
            });
    }, []);

    const handleImageChange = (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setHasChanges(true);
        }
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        if (image1 && image1 instanceof File) {
            formData.append('file1', image1);
        } else if (image1 && typeof image1 === 'string') {
            formData.append('file1', image1);
        }

        if (image2 && image2 instanceof File) {
            formData.append('file2', image2);
        } else if (image2 && typeof image2 === 'string') {
            formData.append('file2', image2);
        }

        const url = isEditMode
            ? `https://be-pjhk4.onrender.com/api/aboutus/${aboutUsData.id}`
            : 'https://be-pjhk4.onrender.com/api/aboutus';

        const method = isEditMode ? 'put' : 'post';

        axios({
            method,
            url,
            data: formData,
        })
            .then(() => {
                alert(isEditMode ? "Changes saved successfully!" : "New item added successfully!");
                setHasChanges(false);
            })
            .catch((error) => {
                console.error("Error saving About Us data", error);
                alert("Failed to save changes.");
            });
    };

    return (
        <div style={styles.pageContainer}>
            {aboutUsData !== null ? (
                <div style={styles.container}>
                    {/* Title Section */}
                    <div style={styles.accordionItem}>
                        <h2 style={styles.cardTitle}>Title</h2>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasChanges(true);
                            }}
                            style={styles.inputField}
                        />
                    </div>

                    {/* Description Section */}
                    <div style={styles.accordionItem}>
                        <h2 style={styles.cardTitle}>Description</h2>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setHasChanges(true);
                            }}
                            style={styles.textareaField}
                        />
                    </div>

                    {/* Image 1 Section */}
                    <div style={styles.accordionItem}>
                        <h2 style={styles.cardTitle}>Image 1</h2>
                        <input
                            type="file"
                            onChange={(e) => handleImageChange(e, setImage1)}
                            style={styles.fileInput}
                        />
                        {image1 && typeof image1 === 'string' ? (
                            <img
                                src={`https://be-pjhk4.onrender.com/api/aboutus/AboutUsImages/${image1}`}
                                alt="Image 1 preview"
                                style={styles.imagePreview}
                            />
                        ) : image1 && image1 instanceof File ? (
                            <img
                                src={URL.createObjectURL(image1)}
                                alt="Image 1 preview"
                                style={styles.imagePreview}
                            />
                        ) : null}
                    </div>

                    {/* Image 2 Section */}
                    <div style={styles.accordionItem}>
                        <h2 style={styles.cardTitle}>Image 2</h2>
                        <input
                            type="file"
                            onChange={(e) => handleImageChange(e, setImage2)}
                            style={styles.fileInput}
                        />
                        {image2 && typeof image2 === 'string' ? (
                            <img
                                src={`https://be-pjhk4.onrender.com/api/aboutus/AboutUsImages/${image2}`}
                                alt="Image 2 preview"
                                style={styles.imagePreview}
                            />
                        ) : image2 && image2 instanceof File ? (
                            <img
                                src={URL.createObjectURL(image2)}
                                alt="Image 2 preview"
                                style={styles.imagePreview}
                            />
                        ) : null}
                    </div>

                    {/* Save Button */}
                    <div style={styles.saveButtonContainer}>
                        <button onClick={handleSave} style={styles.saveButton}>
                            {isEditMode ? "Save Changes" : "Add New"}
                        </button>
                    </div>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};


// ABOUT US CARD
const AdminAboutUsCard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image1, setImage1] = useState(null);
    const [initialImage, setInitialImage] = useState(null);
    const [initialImageFileName, setInitialImageFileName] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // True when editing an existing card
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [aboutUsCardData, setAboutUsCardData] = useState([]);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null);
    const [openModal, setOpenModal] = useState(false); // New state for managing modal visibility

    useEffect(() => {
        // Fetch data for the About Us Cards
        axios.get('https://be-pjhk4.onrender.com/api/aboutuscard')
            .then((response) => {
                setAboutUsCardData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching About Us Card data", error);
            });
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage1(file);
            setHasChanges(true);
        }
    };

    const handleSave = () => {
        // Validation for empty title and description
        if (!title || !description) {
            alert("Title and Description cannot be empty.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        if (image1) {
            formData.append('file1', image1); // Send new image
        } else if (initialImageFileName) {
            formData.append('aboutCardImage', initialImageFileName);
        }

        const url = isEditMode
            ? `https://be-pjhk4.onrender.com/api/aboutuscard/${editingCardId}`
            : 'https://be-pjhk4.onrender.com/api/aboutuscard';

        const method = isEditMode ? 'put' : 'post';

        axios({
            method,
            url,
            data: formData,
        })
            .then(() => {
                setHasChanges(false);
                fetchAboutUsCardData();
                // Reset form fields after saving
                resetForm();
                setIsEditMode(false);
                setOpenModal(false); // Close the modal after saving
            })
            .catch((error) => {
                console.error("Error saving About Us data", error);
                alert("Failed to save changes.");
            });
    };

    const handleDiscardChanges = () => {
        if (hasChanges) {
            const userConfirmed = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
            if (userConfirmed) {
                resetForm();
                setIsEditMode(false);
                setOpenModal(false); // Close the modal if changes are discarded
            }
        } else {
            resetForm();
            setIsEditMode(false);
            setOpenModal(false); // Close the modal if no changes
        }
    };

    const handleEdit = (card) => {
        setIsEditMode(true);
        setTitle(card.title);
        setDescription(card.description);
        setInitialImage(card.aboutCardImage);
        setInitialImageFileName(card.aboutCardImage);
        setEditingCardId(card.id);
        setOpenModal(true); // Open the modal when editing an existing card
    };

    const handleDelete = () => {
        axios.delete(`https://be-pjhk4.onrender.com/api/aboutuscard/${cardToDelete?.id}`)
            .then(() => {
                alert("Card deleted successfully!");
                fetchAboutUsCardData();
                setOpenDeleteModal(false);
            })
            .catch((error) => {
                console.error("Error deleting About Us Card", error);
                alert("Failed to delete card.");
            });
    };

    const fetchAboutUsCardData = () => {
        axios.get('https://be-pjhk4.onrender.com/api/aboutuscard')
            .then((response) => {
                setAboutUsCardData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching About Us Card data", error);
            });
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImage1(null);
        setInitialImage(null);
        setInitialImageFileName(null);
    };

    if (!aboutUsCardData.length) {
        return <div>Loading...</div>;
    }

    return (
        <div style={aboutusstyles.container}>
            <h2>About Us Cards</h2>

            {/* Add Card Button */}
            <Box mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setIsEditMode(false); // Set to 'false' to indicate adding new card
                        resetForm();
                        setOpenModal(true); // Open the modal when adding a new card
                    }}
                >
                    Add New Card
                </Button>
            </Box>

            {/* Render Cards in a grid layout */}
            <Grid container spacing={2}>
                {aboutUsCardData.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.id}>
                        <Card style={aboutusstyles.card}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={card.aboutCardImage ? `https://be-pjhk4.onrender.com/api/aboutuscard/AboutUsImages/${card.aboutCardImage}` : ''}
                                alt={card.title}
                                style={aboutusstyles.cardImage}
                            />
                            <CardContent>
                                <Typography variant="h6">{card.title}</Typography>
                                <Typography variant="body2">{card.description}</Typography>
                            </CardContent>
                            <Box display="flex" justifyContent="space-between" p={1}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Edit />}
                                    onClick={() => handleEdit(card)}
                                    style={aboutusstyles.button}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<DeleteForever />}
                                    onClick={() => {
                                        setCardToDelete(card);
                                        setOpenDeleteModal(true);
                                    }}
                                    style={aboutusstyles.button}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Edit/Add Card Modal */}
            <Modal open={openModal} onClose={handleDiscardChanges}>
                <Box sx={aboutusstyles.modalBox}>
                    <h2>{isEditMode ? "Edit About Us Card" : "Add About Us Card"}</h2>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={aboutusstyles.textarea}
                    />
                    {initialImage && (
                        <div>
                            <img
                                src={`https://be-pjhk4.onrender.com/api/aboutuscard/AboutUsImages/${initialImage}`}
                                alt="Current About Us Image"
                                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
                            />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={aboutusstyles.fileInput} />
                    <Box mt={2} style={aboutusstyles.buttonContainer}>
                        <Button variant="contained" onClick={handleSave} style={aboutusstyles.saveButton}>
                            Save
                        </Button>
                        <Button variant="outlined" onClick={handleDiscardChanges} style={aboutusstyles.cancelButton}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <Box sx={aboutusstyles.deleteModalBox}>
                    <Typography variant="h6">Are you sure you want to delete this card?</Typography>
                    <Box mt={2} style={aboutusstyles.buttonContainer}>
                        <Button variant="contained" color="error" onClick={handleDelete} style={aboutusstyles.deleteButton}>
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={() => setOpenDeleteModal(false)} style={aboutusstyles.cancelButton}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};




// Styles (same as before)
const styles = {
    pageContainer: {
        padding: '32px',
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    toggleButtonContainer: {
        display: 'flex',
        justifyContent: 'center',  // Centering the button horizontally
        marginBottom: '20px',
    },
    toggleButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
    },
    section: {
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '20px',
        marginBottom: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '10px',
    },
    inputField: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    textareaField: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        height: '150px',
    },
    fileInput: {
        marginTop: '12px',
        marginBottom: '12px',
    },
    imagePreview: {
        marginTop: '12px',
        maxWidth: '200px',
        maxHeight: '200px',
        objectFit: 'cover',
    },
    saveButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
    },
    cardContainer: {
        marginTop: '20px',
    },

    // Fancy Accordion Section Styles
    accordionContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '20px',
    },
    accordionItem: {
        backgroundColor: '#f9f9f9',  // Subtle background color for each item
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '10px',  // Rounded corners for the accordion items
        border: '2px solid #4CAF50',  // Thicker green border to give it a fancy look
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',  // Light shadow for depth
        transition: 'all 0.3s ease',  // Smooth transition effect
    },
    accordionItemHeader: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '10px',
        cursor: 'pointer',  // Make the header clickable
        transition: 'color 0.3s ease',
    },
    accordionItemContent: {
        paddingTop: '10px',
    },
    accordionItemHover: {
        backgroundColor: '#e0f7e0',  // Light green hover effect
        borderColor: '#388e3c',  // Darker green border on hover
    },
}

const aboutusstyles = {
    container: {
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // This creates the shadow like in the first styles
        borderRadius: '8px', // Rounded corners for cards
        border: '1px solid #ccc', // Border around the card
    },
    cardImage: {
        objectFit: 'cover',
        borderRadius: '8px 8px 0 0', // Same rounded corners for the top of the card
        height: '200px', // Ensuring the image has consistent size
    },
    button: {
        width: '48%',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px 16px',
        borderRadius: '8px', // Rounded corners
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Same box shadow for buttons
        border: '1px solid #ccc', // Border for buttons, just like input fields
        transition: 'all 0.3s ease', // Smooth transition on hover or interaction
    },
    modalBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px', // Rounded corners for modals
        boxShadow: 24, // Same shadow as previous styles
        width: '400px',
        border: '1px solid #ccc', // Added border for consistency
    },
    textarea: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px', // Rounded corners for textarea
        border: '1px solid #ccc', // Border for the textarea to match input fields
        marginBottom: '20px',
    },
    fileInput: {
        marginTop: '12px',
        marginBottom: '12px',
        borderRadius: '4px', // Rounded corners for file input as well
        border: '1px solid #ccc', // Adding border to match consistency
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '8px', // Rounded corners
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow for buttons
        transition: 'all 0.3s ease', // Smooth transition effect
        border: '1px solid #4CAF50', // Matching border to the button
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '8px', // Rounded corners
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow for buttons
        transition: 'all 0.3s ease',
    },
    deleteModalBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px', // Rounded corners for delete modal
        boxShadow: 24, // Same box shadow for delete modal
        width: '300px',
        border: '1px solid #ccc', // Border for delete modal
    },
    deleteButton: {
        backgroundColor: '#f44336',
        color: 'white',
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '8px', // Rounded corners for the delete button
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow effect for the delete button
        transition: 'all 0.3s ease', // Smooth transition
        border: '1px solid #f44336', // Border matching button color
    },
};



const aboutusaccordionstyles = {
    toggleButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    toggleButton: {
        backgroundColor: '#4CAF50',  // Green background color
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '25px',  // Rounded corners for a smoother button
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        display: 'flex',  // To align the text and icon properly
        alignItems: 'center',  // Center the text and icon vertically
    },
    toggleButtonIcon: {
        marginLeft: '10px',  // Spacing between the text and icon
        fontSize: '20px',  // Size of the icon
        transition: 'transform 0.3s ease',  // Smooth transition for rotating the icon
    },
    toggleButtonHover: {
        backgroundColor: '#45a049',  // Darker green on hover
        transform: 'scale(1.05)',  // Slightly enlarge the button for hover effect
    },
    cardContainer: {
        padding: '10px',
        marginTop: '10px',
    },
};
