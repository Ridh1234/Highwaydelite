import mongoose, { Schema } from 'mongoose';
import { INote } from '../types';

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for user notes lookup
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INote>('Note', noteSchema);
