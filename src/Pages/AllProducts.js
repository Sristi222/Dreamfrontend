"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../components/ProductSection.css"

const API_URL = import.meta.env.VITE_API_URL // ✅ Use environment variable for deployment

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
  const [searchTerm, setSearchTerm] = useState("")
  const location = useLocation()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`) // ✅ Updated API URL
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
          (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase()))
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
              onClick={() => setCurrentMainCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {currentMainCategory !== "all" && subCategories[currentMainCategory] && (
          <div className="filter-options sub-filter">
            {subCategories[currentMainCategory].map((subCategory) => (
              <button
                key={subCategory}
                className={`filter-button ${currentSubCategory === subCategory ? "active" : ""}`}
                onClick={() => setCurrentSubCategory(subCategory)}
              >
                {subCategory}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
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
                      src={product.imageUrl ? `${API_URL}${product.imageUrl}` : "/placeholder.svg"} // ✅ Fixed image URL
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">Rs. {product.price}</p>
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
      <Footer />
    </div>
  )
}

export default AllProducts
