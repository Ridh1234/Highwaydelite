import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notesAPI } from '../../services/api';
import type { Note, CreateNoteData, ErrorResponse } from '../../types';
import NoteCard from './NoteCard.tsx';
import CreateNoteModal from './CreateNoteModal.tsx';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Failed to fetch notes' };
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: CreateNoteData) => {
    try {
      const response = await notesAPI.createNote(noteData);
      setNotes(prev => [response.data.note, ...prev]);
      setShowCreateModal(false);
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Failed to create note' };
      throw new Error(errorData.message);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Failed to delete note' };
      alert(errorData.message);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };


  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="logo" style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
            <img src="/logo.png" alt="Logo" className="logo-image" style={{width:'42px',height:'42px',objectFit:'contain'}} />
            <span className="dashboard-title">Dashboard</span>
            <button onClick={handleSignOut} className="logout-btn logout-btn-inline-mobile" style={{marginLeft:'8px'}}>Sign Out</button>
          </div>
          <div className="user-menu" style={{gap:'1.25rem'}}>
            <div className="user-info" style={{alignItems:'flex-end'}}>
              <span className="user-name">Welcome, {user?.name}!</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="logout-btn logout-btn-desktop">Sign Out</button>
          </div>
        </nav>
      </header>
  <main className="dashboard-content">

      {/* Mobile greeting card (shown only on small screens via CSS) */}
      <div className="mobile-greeting-card">
        <div className="mg-name">Welcome, {user?.name}!</div>
        <div className="mg-email">{user?.email}</div>
      </div>

  <div className="notes-section">
          <div className="notes-header">
            <h2 className="notes-title">Notes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-note-btn"
            >
              Create Note
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {notes.length === 0 ? (
            <div className="empty-state">
              <h3>No notes yet</h3>
              <p>Create your first note to get started!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={() => handleDeleteNote(note._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateNoteModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNote}
        />
      )}
    </div>
  );
};

export default Dashboard;
