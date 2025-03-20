"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Edit, Trash2, Plus, Search, ChevronUp, ChevronDown, BarChart2, Package, Users, DollarSign } from "lucide-react"
import "./AdminDashboard.css"

const mainCategories = [
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

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    description: "",
    image: null,
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [categoryStats, setCategoryStats] = useState({})
  const [subCategoryStats, setSubCategoryStats] = useState({})

  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const sorted = [...products]
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    const filtered = sorted.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredProducts(filtered)

    // Calculate category stats
    const stats = {}
    mainCategories.forEach((category) => {
      stats[category.id] = products.filter((product) => product.category === category.id).length
    })
    setCategoryStats(stats)

    // Calculate subcategory stats
    const subStats = {}
    products.forEach((product) => {
      if (product.subCategory) {
        subStats[product.subCategory] = (subStats[product.subCategory] || 0) + 1
      }
    })
    setSubCategoryStats(subStats)
  }, [searchTerm, products, sortConfig])

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products")
      setProducts(res.data)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: type === "checkbox" ? checked : value,
      })
    } else {
      setNewProduct({
        ...newProduct,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: file })
    } else {
      setNewProduct({ ...newProduct, image: file })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    const productData = editingProduct || newProduct

    for (const key in productData) {
      formData.append(key, productData[key])
    }

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
        alert("✅ Product updated successfully!")
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
        alert("✅ Product added successfully!")
      }

      setNewProduct({
        name: "",
        price: "",
        category: "",
        subCategory: "",
        description: "",
        image: null,
      })
      setEditingProduct(null)
      fetchProducts()
      setActiveSection("allProducts")
    } catch (error) {
      console.error("❌ Error submitting product:", error)
      alert(`Error: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("✅ Product deleted successfully!")
      fetchProducts()
    } catch (error) {
      console.error("❌ Error deleting product:", error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setActiveSection("editProduct")
  }

  const handleSignOut = () => {
    localStorage.removeItem("token")
    alert("✅ You have been signed out.")
    navigate("/")
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleFeaturedToggle = async (id, currentFeatured) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/products/${id}`,
        { featured: !currentFeatured },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      fetchProducts()
    } catch (error) {
      console.error("❌ Error updating featured status:", error)
      alert("Failed to update featured status. Please try again.")
    }
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeSection === "dashboard" ? "active" : ""} onClick={() => setActiveSection("dashboard")}>
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </li>
          <li
            className={activeSection === "allProducts" ? "active" : ""}
            onClick={() => setActiveSection("allProducts")}
          >
            <Package size={20} />
            <span>Products</span>
          </li>
          <li className={activeSection === "addProduct" ? "active" : ""} onClick={() => setActiveSection("addProduct")}>
            <Plus size={20} />
            <span>Add Product</span>
          </li>
        </ul>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="content">
        <header className="content-header">
          <h1>
            {activeSection === "dashboard"
              ? "Dashboard"
              : activeSection === "allProducts"
                ? "All Products"
                : "Add Product"}
          </h1>
        </header>

        {activeSection === "dashboard" && (
          <div className="dashboard-overview">
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon">
                  <Package size={24} />
                </div>
                <div className="card-info">
                  <h3>Total Products</h3>
                  <p>{products.length}</p>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">
                  <Users size={24} />
                </div>
                <div className="card-info">
                  <h3>Categories</h3>
                  <p>{Object.keys(categoryStats).length}</p>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">
                  <DollarSign size={24} />
                </div>
                <div className="card-info">
                  <h3>Total Value</h3>
                  <p>Rs. {products.reduce((sum, product) => sum + Number(product.price), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="category-breakdown">
              <h3>Category Breakdown</h3>
              <ul>
                {mainCategories.map((category) => (
                  <li key={category.id}>
                    <span>{category.name}</span>
                    <span>{categoryStats[category.id] || 0}</span>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${((categoryStats[category.id] || 0) / products.length) * 100}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="subcategory-breakdown">
              <h3>Subcategory Breakdown</h3>
              <div className="subcategory-grid">
                {Object.entries(subCategoryStats).map(([subCategory, count]) => (
                  <div key={subCategory} className="subcategory-card">
                    <h4>{subCategory}</h4>
                    <p>
                      {count} product{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeSection === "addProduct" || activeSection === "editProduct") && (
          <div className="add-product">
            <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="text"
                name="name"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={handleChange}
                placeholder="Product Name"
                required
              />
              <input
                type="number"
                name="price"
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={handleChange}
                placeholder="Price"
                required
              />
              <select
                name="category"
                value={editingProduct ? editingProduct.category : newProduct.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {(editingProduct?.category || newProduct.category) && (
                <select
                  name="subCategory"
                  value={editingProduct ? editingProduct.subCategory : newProduct.subCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subCategories[editingProduct?.category || newProduct.category]?.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                name="description"
                value={editingProduct ? editingProduct.description : newProduct.description}
                onChange={handleChange}
                placeholder="Product Description"
                required
              />
              <input type="file" name="image" accept="image/*" onChange={handleImageUpload} />
              <button type="submit" className="submit-btn">
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {activeSection === "allProducts" && (
          <>
            <div className="products-header">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="add-btn" onClick={() => setActiveSection("addProduct")}>
                <Plus size={20} /> Add Product
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>
                      Name{" "}
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "ascending" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </th>
                    <th onClick={() => handleSort("category")}>
                      Category{" "}
                      {sortConfig.key === "category" &&
                        (sortConfig.direction === "ascending" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </th>
                    <th onClick={() => handleSort("subCategory")}>
                      Subcategory{" "}
                      {sortConfig.key === "subCategory" &&
                        (sortConfig.direction === "ascending" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </th>
                    <th onClick={() => handleSort("price")}>
                      Price{" "}
                      {sortConfig.key === "price" &&
                        (sortConfig.direction === "ascending" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </th>
                    <th>Image</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.subCategory}</td>
                      <td>Rs. {product.price}</td>
                      <td>
                        <img
                          src={`http://localhost:5000${product.imageUrl}`}
                          alt={product.name}
                          className="product-img"
                        />
                      </td>
                      <td className="action-icons">
                        <button className="edit-btn" onClick={() => handleEdit(product)}>
                          <Edit size={18} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

