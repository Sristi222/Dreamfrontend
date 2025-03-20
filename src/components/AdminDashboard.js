"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Edit, Trash2, Plus, Search, ChevronUp, ChevronDown, BarChart2, Package, Users, DollarSign } from "lucide-react"
import "./AdminDashboard.css"

const API_URL = import.meta.env.VITE_API_URL // ✅ Use environment variable for deployment

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

    const stats = {}
    mainCategories.forEach((category) => {
      stats[category.id] = products.filter((product) => product.category === category.id).length
    })
    setCategoryStats(stats)

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
      const res = await axios.get(`${API_URL}/products`) // ✅ Use API_URL
      setProducts(res.data)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
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
        await axios.put(`${API_URL}/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
        alert("✅ Product updated successfully!")
      } else {
        await axios.post(`${API_URL}/products`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
        alert("✅ Product added successfully!")
      }

      setNewProduct({ name: "", price: "", category: "", subCategory: "", description: "", image: null })
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
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("✅ Product deleted successfully!")
      fetchProducts()
    } catch (error) {
      console.error("❌ Error deleting product:", error)
    }
  }

  return (
    <div className="admin-container">
      <div className="content">
        {activeSection === "allProducts" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
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
                        src={`${API_URL}${product.imageUrl}`} // ✅ Updated Image URL
                        alt={product.name}
                        className="product-img"
                      />
                    </td>
                    <td className="action-icons">
                      <button className="edit-btn" onClick={() => setEditingProduct(product)}>
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
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
