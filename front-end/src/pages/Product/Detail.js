import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'; 
import Header from "../../components/Common/Header";
import Footer from "../../components/Common/Footer";
import ProductDetail from '../../components/Product/ProductDetail';
import Review from "../../components/Product/Review/Review";
import SimilarProducts from "../../components/Product/ListsameProduct/SimilarProducts";
import QuestionList from "../../components/Product/QuestionList/QuestionList";

function Detail() {
  const { id } = useParams(); // Lấy productId từ URL
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  console.log(id)
  console.log("Current URL:", window.location.href);
  console.log("Product ID từ useParams:", id);

  return (
   <>
   <Header />
   <ProductDetail productId={id} />
   <SimilarProducts productId={id} />
      <Review productId={id} />
      <QuestionList productId={id} />
   <Footer />
   </>
  )
}

export default Detail