import React from 'react';
import { FiClock, FiUser, FiStar, FiChevronRight, FiFolder } from 'react-icons/fi';

const HistoryCard = ({ record, onViewDetails }) => {
  const { id, title, category, editor, rating, timestamp, story } = record;

  // Format timestamp (ISO string to friendly format)
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent Date';
    }
  };

  // Get first 150 characters of story as preview
  const storyPreview = story 
    ? story.slice(0, 150) + (story.length > 150 ? '...' : '')
    : 'No story text available.';

  return (
    <div className="glass-panel rounded-xl p-5 glass-panel-hover flex flex-col justify-between h-full border border-darkbg-border hover:border-brand/30">
      <div>
        {/* Card Header Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[9px] font-bold uppercase tracking-wider bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 rounded-full">
            {category || 'General'}
          </span>
          
          <div className="flex items-center gap-1">
            {rating ? (
              <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                <FiStar className="fill-yellow-500" size={10} />
                <span>{rating}</span>
              </div>
            ) : (
              <span className="text-[10px] text-gray-500 border border-darkbg-border px-1.5 py-0.5 rounded font-mono font-medium">
                Unrated
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-display font-bold text-base text-white hover:text-brand transition-colors line-clamp-2 mb-2 cursor-pointer" onClick={() => onViewDetails(id)}>
          {title || 'Story Analysis Report'}
        </h4>

        {/* Story Text Preview */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-4">
          {storyPreview}
        </p>
      </div>

      {/* Card Footer Metadata */}
      <div className="border-t border-darkbg-border pt-3.5 mt-auto flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
            <FiClock size={11} className="text-gray-500" />
            <span>{formatDate(timestamp)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
            <FiUser size={11} className="text-gray-500" />
            <span className="truncate max-w-[120px]" title={editor}>{editor || 'editor@telanganatoday.com'}</span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(id)}
          className="flex h-7 items-center justify-center gap-1 rounded-md bg-darkbg-deep hover:bg-brand hover:text-white border border-darkbg-border hover:border-brand px-2.5 text-xs text-gray-300 font-medium transition-all"
        >
          <span>View</span>
          <FiChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;
