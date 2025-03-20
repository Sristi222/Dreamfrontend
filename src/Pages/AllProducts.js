"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../components/ProductSection.css"

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
]

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
}

const AllProducts = () => {
  const [currentMainCategory, setCurrentMainCategory] = useState("all")
  const [currentSubCategory, setCurrentSubCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const location = useLocation()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products")
        setProducts(response.data || [])
      } catch (error) {
        console.error("❌ Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const search = searchParams.get("search")
    if (search) {
      setSearchTerm(search)
      setCurrentMainCategory("all")
      setCurrentSubCategory(null)
    }
  }, [location])

  const getFilteredProducts = () => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    } else {
      if (currentMainCategory !== "all") {
        filtered = filtered.filter((product) => product.category === currentMainCategory)
      }
      if (currentSubCategory) {
        filtered = filtered.filter((product) => product.subCategory === currentSubCategory)
      }
    }

    return filtered
  }

  const handleMainCategoryClick = (category) => {
    setCurrentMainCategory(category)
    setCurrentSubCategory(null)
    setSearchTerm("")
  }

  const handleSubCategoryClick = (subCategory) => {
    setCurrentSubCategory(subCategory)
    setSearchTerm("")
  }

  const openModal = (product) => {
    setModalProduct(product)
    setIsModalVisible(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalVisible(false)
    document.body.style.overflow = "visible"
    setTimeout(() => {
      setModalProduct(null)
    }, 300)
  }

  const filteredProducts = getFilteredProducts()

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

        {currentMainCategory !== "all" && subCategories[currentMainCategory] && (
          <div className="filter-options sub-filter">
            <div className="sub-categories">
              {subCategories[currentMainCategory].map((subCategory) => (
                <button
                  key={subCategory}
                  className={`filter-button ${currentSubCategory === subCategory ? "active" : ""}`}
                  onClick={() => handleSubCategoryClick(subCategory)}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>
        )}

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
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : "/placeholder.svg"}
                      alt={product.name}
                      className="product-image"
                    />
                    <button className="view-btn" onClick={() => openModal(product)}>
                      Quick View
                    </button>
                  </div>
                  <div className="product-content">
                    <div className="price-section">
                      <div className="price-wrapper">
                        <span className="current-price">Rs. {product.price}</span>
                      </div>
                    </div>

                    <div className="product-availability">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 7h-9.8C9.5 7 9 7.5 9 8.2v.6c0 .7.5 1.2 1.2 1.2H20c.6 0 1-.4 1-1s-.4-1-1-1z"></path>
                        <path d="M20 14h-9.8c-.7 0-1.2.5-1.2 1.2v.6c0 .7.5 1.2 1.2 1.2H20c.6 0 1-.4 1-1s-.4-1-1-1z"></path>
                        <path d="M12 2v20"></path>
                        <path d="M4 12h8"></path>
                      </svg>
                      <span>In Stock</span>
                    </div>

                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-products-message">No products available.</p>
            )}
          </div>
        )}

        <div className="view-all-container">
          <a href="/" className="back-btn">
            Back to Home
          </a>
        </div>
      </div>

      {modalProduct && (
        <div className={`modal ${isModalVisible ? "show" : ""}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={modalProduct.imageUrl ? `http://localhost:5000${modalProduct.imageUrl}` : "/placeholder.svg"}
              alt={modalProduct.name}
              className="modal-image"
            />
            <h2 className="modal-product-title">{modalProduct.name}</h2>
            <p className="modal-product-description">{modalProduct.description}</p>
            <p className="modal-product-price">Rs. {modalProduct.price}</p>
            {modalProduct.sizes && modalProduct.sizes.length > 0 && (
              <div className="modal-product-sizes">
                <p>
                  Available sizes: {modalProduct.sizes.join(", ")} {modalProduct.sizeUnit}
                </p>
              </div>
            )}
            {modalProduct.details && <div className="modal-product-details">{modalProduct.details}</div>}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AllProducts

