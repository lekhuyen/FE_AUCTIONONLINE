import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, TextareaAutosize, Modal, Box, Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { DeleteForever, Edit } from '@mui/icons-material';

export const AdminAboutUsCard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image1, setImage1] = useState(null);
    const [initialImage, setInitialImage] = useState(null); // Store the initial image
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [aboutUsCardData, setAboutUsCardData] = useState([]);
    const [cardToDelete, setCardToDelete] = useState(null);

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
        if (image1 && image1 instanceof File) {
            formData.append('file1', image1); // Send new image
        } else if (initialImage) {
            // Include the existing image name if no new image is uploaded
            formData.append('aboutCardImage', initialImage);
        }

        const url = isEditMode
            ? `http://localhost:8080/api/aboutuscard/${title}`  // Use `title` for edit
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
                setIsEditMode(false);
            }
        } else {
            // Reset only if there are no changes
            setTitle('');
            setDescription('');
            setImage1(null);
            setInitialImage(null); // Reset initial image as well
            setIsEditMode(false);
        }
    };

    const handleEdit = (card) => {
        setIsEditMode(true);
        setTitle(card.title);
        setDescription(card.description);
        setInitialImage(card.aboutCardImage); // Store the initial image
    };

    const handleDelete = () => {
        axios.delete(`http://localhost:8080/api/aboutuscard/${cardToDelete?.title}`)
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
        <div style={styles.container}>
            <h2>About Us Cards</h2>

            {/* Render Cards in a grid layout */}
            <Grid container spacing={2}>
                {aboutUsCardData.map((card) => (
                    <Grid item xs={12} sm={6} md={4} key={card.title}>
                        <Card style={styles.card}>
                            {/* Image */}
                            <CardMedia
                                component="img"
                                height="200"
                                image={card.aboutCardImage ? `http://localhost:8080/api/aboutuscard/AboutUsImages/${card.aboutCardImage}` : ''}
                                alt={card.title}
                                style={styles.cardImage}
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
                                    style={styles.button}
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
                                    style={styles.button}
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
                <Box sx={styles.modalBox}>
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
                        style={styles.textarea}
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
                    <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
                    <Box mt={2} style={styles.buttonContainer}>
                        <Button variant="contained" onClick={handleSave} style={styles.saveButton}>
                            Save
                        </Button>
                        <Button variant="outlined" onClick={handleDiscardChanges} style={styles.cancelButton}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>


            {/* Delete Confirmation Modal */}
            <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <Box sx={styles.deleteModalBox}>
                    <Typography variant="h6">Are you sure you want to delete this card?</Typography>
                    <Box mt={2} style={styles.buttonContainer}>
                        <Button variant="contained" color="error" onClick={handleDelete} style={styles.deleteButton}>
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={() => setOpenDeleteModal(false)} style={styles.cancelButton}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

const styles = {
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
