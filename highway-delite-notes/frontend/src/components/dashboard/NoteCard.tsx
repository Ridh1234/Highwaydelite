import React from 'react';
import type { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-card">
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>
      <div className="note-meta">
        <span>{formatDate(note.createdAt)}</span>
        <div className="note-actions">
          <button
            onClick={onDelete}
            className="delete-btn"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
