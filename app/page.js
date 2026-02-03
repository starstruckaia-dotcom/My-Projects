'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CURRENT_RESTAURANT_ID } from '../lib/config'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    min_stock: ''
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('restaurant_id', CURRENT_RESTAURANT_ID)
      .order('name')

    if (error) {
      console.error('Supabase fetch error:', error.message)
      setError(error.message)
      setInventory([])
    } else {
      setInventory(data || [])
    }

    setLoading(false)
  }

  function getStockStatus(item) {
    const ratio = item.quantity / item.min_stock
    if (ratio <= 0.5) return { status: 'Critical', class: 'badge-danger' }
    if (ratio <= 1) return { status: 'Low', class: 'badge-warning' }
    return { status: 'Good', class: 'badge-success' }
  }

  function getLowStockItems() {
    return inventory.filter(item => item.quantity <= item.min_stock)
  }

  function getCriticalItems() {
    return inventory.filter(item => item.quantity <= item.min_stock * 0.5)
  }

  function getCategories() {
    return [...new Set(inventory.map(item => item.category))]
  }

  function openAddModal() {
    setEditItem(null)
    setFormData({ name: '', category: '', quantity: '', unit: '', min_stock: '' })
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_stock: item.min_stock.toString()
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const itemData = {
      name: formData.name,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      min_stock: parseFloat(formData.min_stock)
    }

    if (editItem) {
      const { error } = await supabase
        .from('inventory')
        .update(itemData)
        .eq('id', editItem.id)
        .eq('restaurant_id', CURRENT_RESTAURANT_ID)

      if (error) {
        console.error('Update error:', error.message)
        alert('Failed to update item: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('inventory')
        .insert([{ ...itemData, restaurant_id: CURRENT_RESTAURANT_ID }])

      if (error) {
        console.error('Insert error:', error.message)
        alert('Failed to add item: ' + error.message)
        return
      }
    }

    await fetchInventory()
    setShowModal(false)
  }

  async function updateQuantity(item, change) {
    const newQuantity = Math.max(0, item.quantity + change)

    const { error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', item.id)
      .eq('restaurant_id', CURRENT_RESTAURANT_ID)

    if (error) {
      console.error('Quantity update error:', error.message)
      alert('Failed to update quantity: ' + error.message)
      return
    }

    await fetchInventory()
  }

  if (loading) {
    return (
      <main className="main">
        <div className="container">
          <p>Loading inventory...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main">
        <div className="container">
          <div className="card">
            <h2 className="card-title" style={{ color: '#dc2626' }}>Connection Error</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchInventory} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="container">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{inventory.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{getCategories().length}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#eab308' }}>{getLowStockItems().length}</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#dc2626' }}>{getCriticalItems().length}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>

        {/* Alerts Section */}
        {getLowStockItems().length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Stock Alerts</h2>
            </div>
            <div className="alerts-list">
              {getLowStockItems().slice(0, 5).map(item => {
                const status = getStockStatus(item)
                return (
                  <div key={item.id} className="alert-item">
                    <div className={`alert-icon ${status.status === 'Critical' ? 'danger' : 'warning'}`}>
                      {status.status === 'Critical' ? '!' : '⚠'}
                    </div>
                    <div className="alert-content">
                      <div className="alert-title">{item.name} - {status.status}</div>
                      <div className="alert-meta">
                        {item.quantity} {item.unit} remaining (min: {item.min_stock})
                      </div>
                    </div>
                    <button
                      className="btn btn-outline"
                      onClick={() => openEditModal(item)}
                    >
                      Update
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Inventory</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add Item
            </button>
          </div>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const status = getStockStatus(item)
                return (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => updateQuantity(item, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantity} {item.unit}</span>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => updateQuantity(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>{status.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                style={{ padding: '0.25rem 0.75rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Proteins, Produce, Dairy, Pantry"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., lbs, units, gallons"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock Level</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.min_stock}
                  onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editItem ? 'Save Changes' : 'Add Item'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
