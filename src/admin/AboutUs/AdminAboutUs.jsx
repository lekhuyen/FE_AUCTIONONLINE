import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AdminAboutUs = () => {
    const [aboutUsData, setAboutUsData] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

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

    const handleDiscardChanges = () => {
        if (hasChanges) {
            const userConfirmed = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
            if (userConfirmed) {
                setHasChanges(false);
                setTitle(aboutUsData?.title || "");
                setDescription(aboutUsData?.description || "");
                setImage1(aboutUsData?.aboutImage1 || "");
                setImage2(aboutUsData?.aboutImage2 || "");
            }
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        handleDiscardChanges();
    };

    return (
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
                                    onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
                                    style={styles.inputField}
                                />
                            </div>

                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Description</h2>
                                <textarea
                                    value={description}
                                    onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
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
                                    <img src={`http://localhost:8080/api/aboutus/AboutUsImages/${image1}`} alt="Image 1 preview" style={styles.imagePreview} />
                                ) : image1 && image1 instanceof File ? (
                                    <img src={URL.createObjectURL(image1)} alt="Image 1 preview" style={styles.imagePreview} />
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
                                    <img src={`http://localhost:8080/api/aboutus/AboutUsImages/${image2}`} alt="Image 2 preview" style={styles.imagePreview} />
                                ) : image2 && image2 instanceof File ? (
                                    <img src={URL.createObjectURL(image2)} alt="Image 2 preview" style={styles.imagePreview} />
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
    );
};

// Styles (same as before)
const styles = {
    pageContainer: {
        padding: '32px',
        backgroundColor: '#f5f5f5',
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    toggleButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    toggleButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '18px',
        borderRadius: '4px',
        cursor: 'pointer',
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
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
