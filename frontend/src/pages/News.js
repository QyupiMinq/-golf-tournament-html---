import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Plus, Trash2, Send, X, Image as ImageIcon, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const News = () => {
  const { user } = useContext(AuthContext);
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photos: [],
  });
  const [editingNews, setEditingNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNewsList(response.data);
    } catch (error) {
      toast.error('Gagal memuat news');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (newsId) => {
    try {
      const response = await axios.get(`${API}/news/${newsId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, compressedBase64]
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    toast.success(`${files.length} foto ditambahkan`);
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Title dan deskripsi harus diisi');
      return;
    }

    if (formData.photos.length === 0) {
      toast.error('Minimal 1 foto harus diupload');
      return;
    }
    
    try {
      if (editingNews) {
        await axios.put(`${API}/news/${editingNews.id}`, formData);
        toast.success('News berhasil diupdate');
      } else {
        await axios.post(`${API}/news`, formData);
        toast.success('News berhasil ditambahkan');
      }
      fetchNews();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan news');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus news ini?')) return;
    try {
      await axios.delete(`${API}/news/${id}`);
      toast.success('News berhasil dihapus');
      fetchNews();
      if (selectedNews?.id === id) {
        setSelectedNews(null);
      }
    } catch (error) {
      toast.error('Gagal menghapus news');
    }
  };

  const handleAddComment = async (newsId) => {
    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    try {
      await axios.post(`${API}/news/${newsId}/comments`, {
        comment: newComment
      });
      toast.success('Komentar berhasil ditambahkan');
      setNewComment('');
      fetchComments(newsId);
    } catch (error) {
      toast.error('Gagal menambahkan komentar');
    }
  };

  const handleDeleteComment = async (commentId, newsId) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await axios.delete(`${API}/comments/${commentId}`);
      toast.success('Komentar berhasil dihapus');
      fetchComments(newsId);
    } catch (error) {
      toast.error('Gagal menghapus komentar');
    }
  };

  const openNewsDetail = (news) => {
    setSelectedNews(news);
    fetchComments(news.id);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', photos: [] });
    setEditingNews(null);
  };

  const openEditDialog = (news) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      description: news.description,
      photos: news.photos || []
    });
    setOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="news-page" className="pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-600 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            📰 News
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Berita dan Galeri Kegiatan Pertandingan</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-news-btn"
                onClick={resetForm}
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900">
                  {editingNews ? 'Edit News' : 'Tambah News Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Judul</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul berita..."
                    className="border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Deskripsi Kegiatan</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi lengkap kegiatan pertandingan..."
                    rows={6}
                    className="border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Upload Foto Kegiatan</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="border-0 p-0"
                    />
                    <p className="text-xs text-gray-500 mt-2">Upload multiple foto kegiatan pertandingan</p>
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {formData.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img src={photo} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg"
                >
                  {editingNews ? 'Update News' : 'Tambah News'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* News List */}
      {newsList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <ImageIcon className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Belum ada news</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Admin dapat menambahkan news baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02] border border-gray-200 dark:border-gray-700"
              onClick={() => openNewsDetail(news)}
            >
              {/* Thumbnail - First photo */}
              {news.photos && news.photos.length > 0 && (
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={news.photos[0]}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                  {news.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      +{news.photos.length - 1} foto
                    </div>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {news.description}
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{new Date(news.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); openEditDialog(news); }}
                        className="border-green-700 text-green-700 hover:bg-green-50 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleDelete(news.id); }}
                        className="border-red-500 text-red-600 hover:bg-red-50 text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 pr-8">
                {selectedNews.title}
              </DialogTitle>
            </DialogHeader>
            
            {/* Photo Gallery */}
            <div className="space-y-4">
              {selectedNews.photos && selectedNews.photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selectedNews.photos.map((photo, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden shadow-md">
                      <img
                        src={photo}
                        alt={`${selectedNews.title} ${idx + 1}`}
                        className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Deskripsi Kegiatan</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedNews.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedNews.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Komentar ({comments.length})
                </h3>
                
                {/* Add Comment */}
                {user && (
                  <div className="mb-4 sm:mb-6">
                    <div className="flex gap-2 sm:gap-3">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tulis komentar..."
                        className="flex-1 text-sm sm:text-base"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(selectedNews.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAddComment(selectedNews.id)}
                        className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-500 py-8 text-sm sm:text-base">Belum ada komentar</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                              {comment.user_name}
                            </span>
                          </div>
                          {(user?.id === comment.user_id || isAdmin) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.id, selectedNews.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{comment.comment}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(comment.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default News;
