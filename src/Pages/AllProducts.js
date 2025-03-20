"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../components/ProductSection.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const mainCategories = [
  { id: "all", name: "All Products" },
  { id: "exterior", name: "Exterior" },
  { id: "interior", name: "Interior" },
  { id: "distemper", name: "Distemper" },
  { id: "wood-polish", name: "Wood Polish" },
  { id: "pu-polish", name: "PU Polish" },
  { id: "enamel", name: "Enamel" },
  { id: "primer", name: "Primer" },
  { id: "waterproofing", name: "Waterproofing" },
];

const subCategories = {
  exterior: ["Water Puffing", "Ultima Protect Shine", "Apex Ultima", "Apex", "ACE", "Silicon"],
  interior: [
    "Royal Health Shield",
    "Royal Blink",
    "Royal Aspira",
    "Royal Shine",
    "Royal Luxury",
    "Premium Emulsion",
    "Tractor Emulsion",
    "Silicon",
  ],
  distemper: ["Tractor Distemper", "Uno Distemper"],
  "wood-polish": ["Chapra", "Sealer", "Lacker", "Melamine"],
  enamel: ["Premium Gloss Enamel", "Satin Enamel"],
  primer: ["Oil Primer", "Wood Primer", "Metal Primer"],
  waterproofing: ["Damp Proof", "Hydro Lock", "Damp Shield"],
};

const AllProducts = () => {
  const [currentMainCategory, setCurrentMainCategory] = useState("all");
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from:", `${API_URL}/api/products`);

        const response = await axios.get(`${API_URL}/api/products`);
        console.log("API Response:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data);
        } else {
          throw new Error("No products found.");
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
      setCurrentMainCategory("all");
      setCurrentSubCategory(null);
    }
  }, [location]);

  const getFilteredProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      if (currentMainCategory !== "all") {
        filtered = filtered.filter((product) => product.category === currentMainCategory);
      }
      if (currentSubCategory) {
        filtered = filtered.filter((product) => product.subCategory === currentSubCategory);
      }
    }

    return filtered;
  };

  const handleMainCategoryClick = (category) => {
    setCurrentMainCategory(category);
    setCurrentSubCategory(null);
    setSearchTerm("");
  };

  const handleSubCategoryClick = (subCategory) => {
    setCurrentSubCategory(subCategory);
    setSearchTerm("");
  };

  const openModal = (product) => {
    setModalProduct(product);
    setIsModalVisible(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalVisible(false);
    document.body.style.overflow = "visible";
    setTimeout(() => {
      setModalProduct(null);
    }, 300);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="all-products-page">
      <Navbar />
      <div className="container">
        <h1 className="section">All Products</h1>

        {searchTerm && (
          <p className="search-results-text">
            Showing results for: <strong>{searchTerm}</strong>
          </p>
        )}

        <div className="filter-options main-filter">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={`filter-button ${currentMainCategory === category.id ? "active" : ""}`}
              onClick={() => handleMainCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <img
                    src={product.imageUrl ? `${API_URL}${product.imageUrl}` : "/placeholder.svg"}
                    alt={product.name}
                    className="product-image"
                  />
                  <h3>{product.name}</h3>
                  <p>Rs. {product.price}</p>
                  <button onClick={() => openModal(product)}>Quick View</button>
                </div>
              ))
            ) : (
              <p className="no-products-message">No products available.</p>
            )}
          </div>
        )}
      </div>

      {modalProduct && (
        <div className={`modal ${isModalVisible ? "show" : ""}`} onClick={closeModal}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img src={modalProduct.imageUrl ? `${API_URL}${modalProduct.imageUrl}` : "/placeholder.svg"} alt={modalProduct.name} />
            <h2>{modalProduct.name}</h2>
            <p>{modalProduct.description}</p>
            <p>Rs. {modalProduct.price}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AllProducts;
