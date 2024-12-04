import React from "react";
import { Container, Title, Body } from "../components/common/Design";
import "./Contact.css";

export const Contact = () => {
    return (
        <Container>
            <div className="contact-container">
                {/* Section for title and description */}
                <div className="contact-text-center mb-4">
                    <Title level={1}>Contact</Title>
                    <Body className="text-center">Get in touch and ask us anything.</Body>
                </div>

                {/* Form Section */}
                <div className="contact-form mb-5">
                    <form>
                        {/* Row for name and email */}
                        <div className="contact-row mb-3">
                            <div className="contact-col">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="contact-input form-control"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="contact-col">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="contact-input form-control"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                        </div>

                        {/* Row for phone number and interested in */}
                        <div className="contact-phone-interested mb-3">
                            <div className="contact-col">
                                <div className="phone-input-wrapper">
                                    <select
                                        id="country-code"
                                        name="country-code"
                                        className="contact-select country-code-select"
                                    >
                                        <option value="+1">+1 (USA)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+91">+91 (India)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="contact-input phone-input"
                                        placeholder="Phone Number"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="contact-col">
                                <select
                                    id="interested-in"
                                    name="interested-in"
                                    className="contact-select form-select"
                                    required
                                >
                                    <option value="" disabled selected hidden>
                                        Select an option
                                    </option>
                                    <option value="contact">Contact</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="report">Report</option>
                                </select>
                            </div>
                        </div>

                        {/* Message Textarea */}
                        <div className="mb-3">
                            <textarea
                                id="message"
                                name="message"
                                className="contact-textarea form-control"
                                placeholder="How can we help?"
                                rows="4"
                                required
                            />
                        </div>

                        {/* Submit Button and Terms Info */}
                        <div className="mb-3">
                            <button
                                type="submit"
                                className="contact-submit-btn btn btn-primary"
                            >
                                Send Your Message
                            </button>
                            <p className="contact-terms mt-2">
                                By clicking, you are agreeing to our terms and conditions.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Map and Contact Info Section */}
                <div className="mb-5">
                    <div className="row">
                        {/* Map Section */}
                        <div className="col-12">
                            <div className="contact-map-container mb-4">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d325347.6340196447!2d106.82931876240123!3d10.737715195298899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1732275019210!5m2!1sen!2s"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="col-12">
                            <div className="contact-info-container">
                                <Title level={3}>Contact Information</Title>
                                <ul className="list-unstyled">
                                    <li>
                                        <strong>Address:</strong> 123 Street, City, Country
                                    </li>
                                    <li>
                                        <strong>Email:</strong> example@example.com
                                    </li>
                                    <li>
                                        <strong>Phone:</strong> +65 6232 6932
                                    </li>
                                </ul>

                                {/* Social Media Links */}
                                <div className="contact-social-media d-flex justify-content-start">
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="Facebook"
                                    >
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="Twitter"
                                    >
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="LinkedIn"
                                    >
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="YouTube"
                                    >
                                        <i className="fab fa-youtube"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="Instagram"
                                    >
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="btn btn-outline-secondary rounded-circle me-2"
                                        title="TikTok"
                                    >
                                        <i className="fab fa-tiktok"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};
