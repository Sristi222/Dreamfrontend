"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./ProductSection.css"

const ProductSection = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Changed the limit to 6 in the API call
        const response = await axios.get("http://localhost:5000/api/products?limit=6")
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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal()
      }
    }

    if (modalProduct) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [modalProduct])

  // Function to generate random rating data for demo purposes
  const generateRatingData = (productId) => {
    // Use product ID to ensure consistent ratings for the same product
    const seed = productId
      .toString()
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    let currentSeed = seed
    const rng = () => {
      const x = Math.sin(currentSeed++) * 10000
      return x - Math.floor(x)
    }

    const rating = (Math.floor(rng() * 5) + 45) / 10 // Rating between 4.5 and 5.0
    const reviewCount = Math.floor(rng() * 300) + 25 // Review count between 25 and 325

    return { rating, reviewCount }
  }

  // Function to determine if a product is a bestseller (for demo)
  const isBestSeller = (productId) => {
    // Use product ID to make determination consistent
    const seed = productId
      .toString()
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return seed % 3 === 0 // Roughly 1/3 of products will be bestsellers
  }

  const ProductCard = ({ product, openModal }) => {
    const bestSeller = isBestSeller(product._id)

    // Calculate original price (15% higher for demo)
    // const originalPrice = Math.round(product.price * 1.15)

    return (
      <div className="product-card">
        {bestSeller && <div className="best-seller">BEST SELLER</div>}

        <div className="product-image-container">
          <img
            src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : "/placeholder.svg"}
            alt={product.name}
            className="product-image"
          />
          <button className="quick-view-btn" onClick={() => openModal(product)}>
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
    )
  }

  return (
    <section className="products">
      <div className="container">
        <h2 className="section-title">Our Products</h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} openModal={openModal} />
            ))}
          </div>
        )}

        <div className="view-all-container">
          <Link to="/products" className="view-all-btn">
            View All Products
          </Link>
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
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductSection

