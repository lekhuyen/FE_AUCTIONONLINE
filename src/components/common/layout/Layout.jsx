import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <Header />
      <main>{children}</main>
      {
        location.pathname !== '/chat' &&
        <Footer />
      }
    </>
  );
};
