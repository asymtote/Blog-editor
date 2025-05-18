import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit2, Eye, Clock, Calendar } from 'lucide-react';
import { fetchAllBlogs } from '../services/blogService';
import { Blog } from '../types';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  useEffect(() => {
    const getBlogs = async () => {
      try {
        const data = await fetchAllBlogs();
        setBlogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setLoading(false);
      }
    };

    getBlogs();
  }, []);

  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderBlogCard = (blog: Blog) => (
    <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
            {blog.title || 'Untitled Blog'}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            blog.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {blog.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="mr-4">Created: {formatDate(blog.created_at)}</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>Updated: {formatDate(blog.updated_at)}</span>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Link 
            to={`/blog/${blog.id}`} 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
          <Link 
            to={`/editor/${blog.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
        <Link
          to="/editor"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          New Blog
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('published')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'published'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            Published ({publishedBlogs.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drafts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            Drafts ({draftBlogs.length})
          </button>
        </nav>
      </div>

      {activeTab === 'published' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedBlogs.length > 0 ? (
            publishedBlogs.map(renderBlogCard)
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No published blogs yet</p>
              <p className="mt-2">Start writing and publish your first blog</p>
              <Link
                to="/editor"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create New Blog
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftBlogs.length > 0 ? (
            draftBlogs.map(renderBlogCard)
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No drafts found</p>
              <p className="mt-2">Drafts will appear here as you save them</p>
              <Link
                to="/editor"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create New Blog
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogList;