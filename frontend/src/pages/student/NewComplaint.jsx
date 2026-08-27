import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useNotification } from '../../context/NotificationContext';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../../utils/constants';
import {
  FilePlus,
  UploadCloud,
  X,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';

const NewComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Wi-Fi / Internet',
    location: '',
    priority: 'Medium',
    description: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      showError('Attachment file size exceeds the 5MB limit.');
      return;
    }

    setAttachment(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('Please enter a complaint title');
      return;
    }
    if (!formData.location.trim()) {
      showError('Please specify the location of the issue');
      return;
    }
    if (!formData.description.trim()) {
      showError('Please enter a detailed description');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('location', formData.location.trim());
      data.append('priority', formData.priority);
      data.append('description', formData.description.trim());

      if (attachment) {
        data.append('attachment', attachment);
      }

      const res = await complaintService.createComplaint(data);
      if (res.success && res.data) {
        showSuccess(`Complaint registered successfully! ID: ${res.data.complaintNumber}`);
        navigate(`/student/complaints/${res.data._id}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/student/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--slate-500)',
            marginBottom: '0.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Complaints</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Submit a New Complaint
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9375rem' }}>
          Provide clear details regarding the problem so campus administration can assign the right department.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Complaint Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Wi-Fi router disconnection in Hostel Block B"
              value={formData.title}
              onChange={handleChange}
              maxLength={200}
              required
            />
            <span className="form-hint">Summarize the issue in a few words (max 200 chars)</span>
          </div>

          {/* Category and Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Campus Location / Room / Block *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              placeholder="e.g. Block B, 2nd Floor, Lab 204"
              value={formData.location}
              onChange={handleChange}
              maxLength={200}
              required
            />
            <span className="form-hint">Specify exact building, room number, or facility area</span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Please explain the issue in detail: when it started, symptoms, any equipment involved..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              maxLength={3000}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="form-hint">Provide helpful context for technicians</span>
              <span className="form-hint">{formData.description.length} / 3000</span>
            </div>
          </div>

          {/* File Attachment Upload */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">
              Photo or Document Attachment (Optional)
            </label>

            {!attachment ? (
              <label
                htmlFor="file-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  border: '2px dashed var(--slate-300)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--slate-50)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <UploadCloud size={32} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)', marginTop: '0.5rem' }}>
                  Click to browse or drag & drop photo/file
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                  Supported formats: JPG, PNG, WEBP, GIF, PDF, TXT (Max 5MB)
                </span>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt"
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Attachment Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={24} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                      {attachment.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {(attachment.size / (1024 * 1024)).toFixed(2)} MB • {attachment.type || 'File'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger-main)', borderColor: 'var(--danger-border)' }}
                >
                  <X size={16} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--slate-100)',
            }}
          >
            <Link to="/student/complaints" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FilePlus size={18} />
              <span>{loading ? 'Submitting Complaint...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;
