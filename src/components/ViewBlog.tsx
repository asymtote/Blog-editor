import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, Calendar } from 'lucide-react';
import { fetchBlogById } from '../services/blogService';
import { Blog } from '../types';

const ViewBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        try {
          const data = await fetchBlogById(id);
          setBlog(data);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch blog:', error);
          setLoading(false);
          navigate('/');
        }
      }
    };

    loadBlog();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog not found</h2>
        <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Blogs
        </button>
        
        <Link
          to={`/editor/${blog.id}`}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </div>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <header className="p-6 pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
            <div className="flex items-center mr-4 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Published: {formatDate(blog.created_at)}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>Updated: {formatDate(blog.updated_at)}</span>
            </div>
          </div>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="p-6">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default ViewBlog;