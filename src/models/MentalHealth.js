import mongoose from 'mongoose';

const MentalHealthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true, enum: ['happy', 'sad', 'neutral'] },
  stressLevel: { type: Number, required: true },
  sleepHours: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const MentalHealth = mongoose.models.MentalHealth || mongoose.model('MentalHealth', MentalHealthSchema);
export default MentalHealth;