import React from "react";
import Favorites from "../../components/Product/Favorites";
import Header from "../../components/Common/Header";
import Footer from "../../components/Common/Footer";

const FavoritesPage = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="content">
        <Favorites /> 
      </div>
      <Footer /> 
    </div>
  );
};

export default FavoritesPage;
