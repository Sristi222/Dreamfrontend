"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit, Trash2, Plus, Search, ChevronUp, ChevronDown, BarChart2, Package, Users, DollarSign } from "lucide-react";
import "./AdminDashboard.css";

// Backend API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "https://dreambackend-3.onrender.com";

const mainCategories = [
  { id: "exterior", name: "Exterior" },
  { id: "interior", name: "Interior" },
  { id: "distemper", name: "Distemper" },
  { id: "wood-polish", name: "Wood Polish" },
  { id: "pu-polish", name: "PU Polish" },
  { id: "enamel", name: "Enamel" },
  { id: "primer", name: "Primer" },
  { id: "waterproofing", name: "Waterproofing" },
];

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    description: "",
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  useEffect(() => {
    const sorted = [...products];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    const filtered = sorted.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products, sortConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: file });
    } else {
      setNewProduct({ ...newProduct, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const productData = editingProduct || newProduct;

    for (const key in productData) {
      formData.append(key, productData[key]);
    }

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/products`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product added successfully!");
      }

      setNewProduct({
        name: "",
        price: "",
        category: "",
        subCategory: "",
        description: "",
        image: null,
      });
      setEditingProduct(null);
      fetchProducts();
      setActiveSection("allProducts");
    } catch (error) {
      console.error("❌ Error submitting product:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeSection === "dashboard" ? "active" : ""} onClick={() => setActiveSection("dashboard")}>
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </li>
          <li className={activeSection === "allProducts" ? "active" : ""} onClick={() => setActiveSection("allProducts")}>
            <Package size={20} />
            <span>Products</span>
          </li>
          <li className={activeSection === "addProduct" ? "active" : ""} onClick={() => setActiveSection("addProduct")}>
            <Plus size={20} />
            <span>Add Product</span>
          </li>
        </ul>
      </div>

      <div className="content">
        <header className="content-header">
          <h1>{activeSection === "dashboard" ? "Dashboard" : activeSection === "allProducts" ? "All Products" : "Add Product"}</h1>
        </header>

        {activeSection === "allProducts" && (
          <>
            <div className="products-header">
              <div className="search-bar">
                <Search size={20} />
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="add-btn" onClick={() => setActiveSection("addProduct")}>
                <Plus size={20} /> Add Product
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>Name</th>
                    <th onClick={() => handleSort("category")}>Category</th>
                    <th onClick={() => handleSort("subCategory")}>Subcategory</th>
                    <th onClick={() => handleSort("price")}>Price</th>
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
                        <img src={`${API_URL}${product.imageUrl}`} alt={product.name} className="product-img" />
                      </td>
                      <td className="action-icons">
                        <button className="edit-btn" onClick={() => handleEdit(product)}><Edit size={18} /></button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}><Trash2 size={18} /></button>
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
  );
};

export default AdminDashboard;
