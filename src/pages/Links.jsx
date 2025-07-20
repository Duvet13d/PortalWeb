import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import MaskTextReveal from '../components/MaskTextReveal'
import LinkCard from '../components/LinkCard'
import { linksData } from '../data/links'
import { enhancedStorage } from '../utils/enhancedStorage'

const Links = () => {
  const [customLinks, setCustomLinks] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Custom'
  })

  // Load custom links from enhanced storage
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const savedLinks = await enhancedStorage.get('custom_links', { 
          fallbackToBackup: true 
        })
        if (savedLinks) {
          setCustomLinks(savedLinks)
        }
      } catch (error) {
        console.error('Failed to load custom links:', error)
      }
    }

    loadLinks()
  }, [])

  // Save custom links to enhanced storage
  const saveCustomLinks = async (links) => {
    try {
      await enhancedStorage.set('custom_links', links, { backup: true })
      setCustomLinks(links)
    } catch (error) {
      console.error('Failed to save custom links:', error)
    }
  }

  // Get all categories
  const allCategories = ['All', ...new Set([
    ...linksData.map(link => link.category),
    ...customLinks.map(link => link.category)
  ])]

  // Filter links by category
  const filteredCuratedLinks = selectedCategory === 'All' 
    ? linksData 
    : linksData.filter(link => link.category === selectedCategory)
  
  const filteredCustomLinks = selectedCategory === 'All' 
    ? customLinks 
    : customLinks.filter(link => link.category === selectedCategory)

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.url) return

    const newLink = {
      id: editingLink ? editingLink.id : Date.now(),
      ...formData,
      isCustom: true
    }

    let updatedLinks
    if (editingLink) {
      updatedLinks = customLinks.map(link => 
        link.id === editingLink.id ? newLink : link
      )
    } else {
      updatedLinks = [...customLinks, newLink]
    }

    saveCustomLinks(updatedLinks)
    setFormData({ title: '', url: '', description: '', category: 'Custom' })
    setShowAddForm(false)
    setEditingLink(null)
  }

  // Handle edit
  const handleEdit = (link) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description,
      category: link.category
    })
    setShowAddForm(true)
  }

  // Handle delete
  const handleDelete = (linkId) => {
    const updatedLinks = customLinks.filter(link => link.id !== linkId)
    saveCustomLinks(updatedLinks)
  }

  // Reset form
  const resetForm = () => {
    setFormData({ title: '', url: '', description: '', category: 'Custom' })
    setShowAddForm(false)
    setEditingLink(null)
  }

  return (
    <div className="min-h-screen py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <MaskTextReveal 
          className="font-heading text-3xl sm:text-4xl md:text-6xl text-white text-center mb-4"
          delay={0.1}
        >
          LINKS
        </MaskTextReveal>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-gray-300 text-base sm:text-lg text-center mb-8 max-w-2xl mx-auto px-2"
        >
          A curated collection of interesting websites, tools, and resources. Add your own bookmarks to personalize your collection.
        </motion.p>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-accent-1 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Add Link Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-1 hover:bg-accent-2 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bookmark
          </button>
        </motion.div>

        {/* Add/Edit Link Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-gray-900/50 border border-gray-700 rounded-xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingLink ? 'Edit Bookmark' : 'Add New Bookmark'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-accent-1"
                      placeholder="Link title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">URL</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-accent-1"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-accent-1"
                    placeholder="Brief description of the link"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-accent-1"
                    placeholder="Category name"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent-1 hover:bg-accent-2 text-white rounded-lg transition-colors"
                  >
                    {editingLink ? 'Update' : 'Add'} Bookmark
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Links Section */}
        {filteredCustomLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-heading text-white mb-6">Your Bookmarks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCustomLinks.map((link, index) => (
                <div key={link.id} className="relative group">
                  <LinkCard
                    title={link.title}
                    url={link.url}
                    description={link.description}
                    category={link.category}
                    index={index}
                  />
                  {/* Edit/Delete Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-1 bg-gray-800/80 hover:bg-gray-700 text-white rounded"
                      title="Edit bookmark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-1 bg-red-600/80 hover:bg-red-500 text-white rounded"
                      title="Delete bookmark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Curated Links Section */}
        {filteredCuratedLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className="text-2xl font-heading text-white mb-6">Curated Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCuratedLinks.map((link, index) => (
                <LinkCard
                  key={link.id}
                  title={link.title}
                  url={link.url}
                  description={link.description}
                  category={link.category}
                  index={index + filteredCustomLinks.length}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredCuratedLinks.length === 0 && filteredCustomLinks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 mb-4">No links found in the "{selectedCategory}" category.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-accent-1 hover:text-accent-2 transition-colors"
            >
              View all links
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-gray-400 text-sm">
            Links are regularly updated with new discoveries. Add your own bookmarks to build your personal collection.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Links 