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
import {DeleteForever, Edit} from "@mui/icons-material";


export const AdminAboutUs = () => {
    const [aboutUsData, setAboutUsData] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCardOpen, setIsCardOpen] = useState(false); // State to toggle the card


    useEffect(() => {
        axios.get('http://localhost:8080/api/aboutus')
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
            ? `http://localhost:8080/api/aboutus/${aboutUsData.id}`
            : 'http://localhost:8080/api/aboutus';

        const method = isEditMode ? 'put' : 'post';

        axios({
            method,
            url,
            data: formData,
        })
            .then(() => {
                if (!isEditMode) {
                    axios.get('http://localhost:8080/api/aboutus')
                        .then((response) => {
                            if (response.data && response.data.length > 0) {
                                const data = response.data[0];
                                setAboutUsData(data);
                                setTitle(data.title);
                                setDescription(data.description);
                                setImage1(data.aboutImage1);
                                setImage2(data.aboutImage2);
                                setIsEditMode(true);
                                alert("New item added successfully!");
                            }
                        })
                        .catch((error) => {
                            console.error("Error fetching About Us data", error);
                        });
                } else {
                    alert("Changes saved successfully!");
                }

                setHasChanges(false);
            })
            .catch((error) => {
                console.error("Error saving About Us data", error);
                alert("Failed to save changes.");
            });
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleCardSelect = (card) => {
        setSelectedCard(card);
        setIsCardOpen(true); // Open the card when selected
    };

    return (
        <div>
            <div style={styles.pageContainer}>
                {aboutUsData !== null ? (
                    <div style={styles.container}>
                        <div style={styles.toggleButtonContainer}>
                            <button onClick={toggleExpand} style={styles.toggleButton}>
                                {isExpanded ? "Collapse" : "Expand"} About Us Section
                            </button>
                        </div>

                        {isExpanded && (
                            <div style={styles.section}>
                                <div style={styles.card}>
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

                                <div style={styles.card}>
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

                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>Image 1</h2>
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageChange(e, setImage1)}
                                        style={styles.fileInput}
                                    />
                                    {image1 && typeof image1 === 'string' ? (
                                        <img src={`http://localhost:8080/api/aboutus/AboutUsImages/${image1}`}
                                             alt="Image 1 preview" style={styles.imagePreview}/>
                                    ) : image1 && image1 instanceof File ? (
                                        <img src={URL.createObjectURL(image1)} alt="Image 1 preview"
                                             style={styles.imagePreview}/>
                                    ) : null}
                                </div>

                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>Image 2</h2>
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageChange(e, setImage2)}
                                        style={styles.fileInput}
                                    />
                                    {image2 && typeof image2 === 'string' ? (
                                        <img src={`http://localhost:8080/api/aboutus/AboutUsImages/${image2}`}
                                             alt="Image 2 preview" style={styles.imagePreview}/>
                                    ) : image2 && image2 instanceof File ? (
                                        <img src={URL.createObjectURL(image2)} alt="Image 2 preview"
                                             style={styles.imagePreview}/>
                                    ) : null}
                                </div>

                                <div style={styles.saveButtonContainer}>
                                    <button onClick={handleSave} style={styles.saveButton}>
                                        {isEditMode ? "Save Changes" : "Add New"}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>

            {/* Button to open/close AdminAboutUsCard with animation */}
            <div style={styles.toggleButtonContainer}>
                <button onClick={() => setIsCardOpen(!isCardOpen)} style={styles.toggleButton}>
                    {isCardOpen ? "Close About Us Card" : "Open About Us Card"}
                </button>
            </div>

            {/* Apply slide-in/fade-in transition when AdminAboutUsCard is visible */}
            <div
                style={{
                    ...styles.cardContainer,
                    opacity: isCardOpen ? 1 : 0,
                    transform: isCardOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'all 0.5s ease-in-out',
                    position: 'relative',
                }}

            >
                {isCardOpen && <AdminAboutUsCard/>} {/* Show the card when isCardOpen is true */}
            </div>
        </div>
    );
};

// ABOUT US CARD
const AdminAboutUsCard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image1, setImage1] = useState(null);
    const [initialImage, setInitialImage] = useState(null); // Store the initial image
    const [initialImageFileName, setInitialImageFileName] = useState(null); // Store the initial image file name
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [aboutUsCardData, setAboutUsCardData] = useState([]);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null); // Track the card being edited by ID

    // Fetch About Us Card data from the backend when component mounts
    useEffect(() => {
        axios.get('http://localhost:8080/api/aboutuscard')
            .then((response) => {
                setAboutUsCardData(response.data);  // Set About Us Card data to state
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
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        // If a new image is uploaded, append it as 'file1'
        if (image1) {
            formData.append('file1', image1); // Send new image
        } else if (initialImageFileName) {
            // Include the existing image name if no new image is uploaded
            formData.append('aboutCardImage', initialImageFileName);
        }

        const url = isEditMode
            ? `http://localhost:8080/api/aboutuscard/${editingCardId}`  // Use `id` for edit
            : 'http://localhost:8080/api/aboutuscard';

        const method = isEditMode ? 'put' : 'post';

        axios({
            method,
            url,
            data: formData,
        })
            .then(() => {
                setHasChanges(false);
                fetchAboutUsCardData();  // Refresh the list after save
                setTitle('');
                setDescription('');
                setImage1(null);
                setInitialImage(null);  // Reset initial image as well
                setInitialImageFileName(null); // Reset initial image file name
                setIsEditMode(false);
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
                setHasChanges(false);
                setTitle('');
                setDescription('');
                setImage1(null);
                setInitialImage(null); // Reset initial image as well
                setInitialImageFileName(null); // Reset initial image file name
                setIsEditMode(false);
            }
        } else {
            // Reset only if there are no changes
            setTitle('');
            setDescription('');
            setImage1(null);
            setInitialImage(null); // Reset initial image as well
            setInitialImageFileName(null); // Reset initial image file name
            setIsEditMode(false);
        }
    };

    const handleEdit = (card) => {
        setIsEditMode(true);
        setTitle(card.title);
        setDescription(card.description);
        setInitialImage(card.aboutCardImage); // Store the initial image
        setInitialImageFileName(card.aboutCardImage); // Store the initial image file name for reference
        setEditingCardId(card.id); // Store the ID for editing
    };

    const handleDelete = () => {
        axios.delete(`http://localhost:8080/api/aboutuscard/${cardToDelete?.id}`)
            .then(() => {
                alert("Card deleted successfully!");
                // Refresh the list after delete
                fetchAboutUsCardData();
            })
            .catch((error) => {
                console.error("Error deleting About Us Card", error);
                alert("Failed to delete card.");
            });
        setOpenDeleteModal(false);
    };

    const fetchAboutUsCardData = () => {
        axios.get('http://localhost:8080/api/aboutuscard')
            .then((response) => {
                setAboutUsCardData(response.data);  // Set About Us Card data to state
            })
            .catch((error) => {
                console.error("Error fetching About Us Card data", error);
            });
    };

    if (!aboutUsCardData.length) {
        return <div>Loading...</div>; // Show loading state while data is being fetched
    }

    return (
        <div style={aboutusstyles.container}>
            <h2>About Us Cards</h2>

            {/* Render Cards in a grid layout */}
            <Grid container spacing={2}>
                {aboutUsCardData.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.id}>
                        <Card style={aboutusstyles.card}>
                            {/* Image */}
                            <CardMedia
                                component="img"
                                height="200"
                                image={card.aboutCardImage ? `http://localhost:8080/api/aboutuscard/AboutUsImages/${card.aboutCardImage}` : ''}
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
            <Modal open={isEditMode || hasChanges} onClose={handleDiscardChanges}>
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
                    {/* Display current image if exists */}
                    {initialImage && (
                        <div>
                            <img
                                src={`http://localhost:8080/api/aboutuscard/AboutUsImages/${initialImage}`}
                                alt="Current About Us Image"
                                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
                            />
                        </div>
                    )}
                    {/* File input for image upload */}
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
};

const aboutusstyles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    cardImage: {
        objectFit: 'cover',
        borderRadius: '8px 8px 0 0',
    },
    button: {
        width: '48%',
    },
    modalBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: 24,
        width: '400px',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginBottom: '20px',
    },
    fileInput: {
        marginBottom: '20px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    saveButton: {
        width: '48%',
    },
    cancelButton: {
        width: '48%',
    },
    deleteModalBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: 24,
        width: '300px',
    },
    deleteButton: {
        width: '100%',
    },
};
