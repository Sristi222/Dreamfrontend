"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./ProductSection.css"

const API_URL = import.meta.env.VITE_API_URL // ✅ Use environment variable for deployment

const ProductSection = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products?limit=6`) // ✅ Use API_URL for deployment
        setProducts(response.data || [])
      } catch (error) {
        console.error("❌ Error fetching products:", error)
        setError("Failed to load products. Please try again later.")
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

  const ProductCard = ({ product }) => {
    return (
      <div className="product-card">
        <div className="product-image-container">
          <img
            src={product.imageUrl ? `${API_URL}${product.imageUrl}` : "/placeholder.svg"} // ✅ Fixed Image URL
            alt={product.name}
            className="product-image"
          />
          <button className="quick-view-btn" onClick={() => openModal(product)}>
            Quick View
          </button>
        </div>

        <div className="product-content">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <p className="product-price">Rs. {product.price}</p>
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
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
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
              src={modalProduct.imageUrl ? `${API_URL}${modalProduct.imageUrl}` : "/placeholder.svg"} // ✅ Fixed Image URL
              alt={modalProduct.name}
              className="modal-image"
            />
            <h2 className="modal-product-title">{modalProduct.name}</h2>
            <p className="modal-product-description">{modalProduct.description}</p>
            <p className="modal-product-price">Rs. {modalProduct.price}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductSection
