import React, { useState } from 'react';
import { FiStar, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi';
import { submitStoryFeedback } from '../services/api';

const RatingComponent = ({ historyId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating first.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitStoryFeedback(historyId, rating, comment);
      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      console.error("Failed to submit rating/feedback:", err);
      setError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel rounded-2xl p-6 glow-orange text-center flex flex-col items-center justify-center gap-3">
        <FiCheckCircle className="text-green-500" size={32} />
        <h3 className="font-display font-bold text-white text-base">Feedback Submitted!</h3>
        <p className="text-xs text-gray-400">
          Thank you. Your rating helps train and improve our Telangana Today AI strategy advice.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 glow-orange">
      <div className="flex items-center gap-2 mb-4 border-b border-darkbg-border pb-3">
        <FiMessageSquare className="text-brand" size={18} />
        <h3 className="font-display font-bold text-white text-base">Rate Advisor Quality</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Select */}
        <div>
          <label className="text-xs text-gray-400 block mb-2">How would you rate these generated angles?</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-colors focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                disabled={submitting}
              >
                <FiStar
                  size={24}
                  className={`cursor-pointer ${
                    star <= (hover || rating)
                      ? 'fill-brand text-brand shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-brand font-mono font-bold ml-2">({rating}/5)</span>
            )}
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label htmlFor="comment" className="text-xs text-gray-400 block mb-1.5">Additional comments (optional)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What went well? How could these recommendations be more accurate?..."
            className="w-full h-20 bg-darkbg-deep/50 border border-darkbg-border rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/50 resize-none transition-all"
            disabled={submitting}
          />
        </div>

        {/* Submit */}
        {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand/10 border border-brand/20 text-brand px-4 py-2.5 text-xs font-semibold hover:bg-brand hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand/10 disabled:hover:text-brand"
        >
          <FiSend size={12} />
          <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
        </button>
      </form>
    </div>
  );
};

export default RatingComponent;
