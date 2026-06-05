import React, { useState } from 'react';
import { FiCpu, FiTrash2, FiFileText } from 'react-icons/fi';

const StoryForm = ({ onSubmit, isLoading }) => {
  const [story, setStory] = useState('');

  const wordCount = story.trim() === '' ? 0 : story.trim().split(/\s+/).length;
  const charCount = story.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (story.trim().length < 50) {
      alert("Please enter a longer story (minimum 50 characters) for a high-quality advisor report.");
      return;
    }
    onSubmit(story);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the story input?")) {
      setStory('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 glow-orange">
      <div className="flex items-center justify-between mb-4 border-b border-darkbg-border pb-3">
        <div className="flex items-center gap-2">
          <FiFileText className="text-brand" size={18} />
          <h2 className="font-display font-bold text-lg text-white">Paste News Story</h2>
        </div>
        
        {story && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
            disabled={isLoading}
          >
            <FiTrash2 size={13} />
            <span>Clear Input</span>
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Paste the published news story here..."
          className="w-full h-80 bg-darkbg-deep/50 border border-darkbg-border rounded-xl px-4 py-3.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 resize-none transition-all"
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-darkbg-deep/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-brand/20 border-t-brand animate-spin"></div>
              <FiCpu className="absolute text-brand animate-pulse" size={18} />
            </div>
            <p className="text-xs font-semibold text-brand tracking-widest uppercase animate-pulse">
              Gemini Analyzing Story...
            </p>
          </div>
        )}
      </div>

      {/* Counters & Submit Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        {/* Count details */}
        <div className="flex gap-4 self-start sm:self-center">
          <div className="text-xs text-gray-400">
            Words: <span className="font-mono text-gray-200 font-semibold">{wordCount}</span>
          </div>
          <div className="text-xs text-gray-400">
            Characters: <span className="font-mono text-gray-200 font-semibold">{charCount}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || story.trim().length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark hover:shadow-[0_0_20px_rgba(255,87,34,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <FiCpu size={16} />
          <span>Generate Strategic Angles</span>
        </button>
      </div>
    </form>
  );
};

export default StoryForm;
