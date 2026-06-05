import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StoryForm from '../components/StoryForm';
import OutputCard from '../components/OutputCard';
import RatingComponent from '../components/RatingComponent';
import { generateStoryInsights } from '../services/api';
import { FiTrendingUp, FiCpu, FiBookmark } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [story, setStory] = useState('');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (storyText) => {
    setIsLoading(true);
    setError('');
    setStory(storyText);
    
    try {
      const data = await generateStoryInsights(storyText, user?.email);
      setOutput(data);
    } catch (err) {
      console.error("Story generation failed:", err);
      setError(err.response?.data?.error || "Failed to generate story strategy angles. Please verify connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!story) return;
    setIsRegenerating(true);
    setError('');

    try {
      const data = await generateStoryInsights(story, user?.email);
      setOutput(data);
      alert("Story recommendations successfully regenerated!");
    } catch (err) {
      console.error("Regeneration failed:", err);
      setError(err.response?.data?.error || "Failed to regenerate story strategy angles.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
          <FiCpu className="text-brand" />
          <span>STORY STRATEGY PLANNER</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Paste published stories to generate diversified editorial angles, follow-up timelines, search trends, and social threads.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-mono">
          {error}
        </div>
      )}

      {/* Grid Workspace */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Story Input (Takes full screen width initially, shrinks to col-4 once output is generated) */}
        <div className={output ? 'lg:col-span-4' : 'lg:col-span-12'}>
          <StoryForm onSubmit={handleGenerate} isLoading={isLoading} />
          
          {/* Rating feedback component below the form if generation is done */}
          {output && (
            <div className="mt-6">
              <RatingComponent historyId={output.id} />
            </div>
          )}
        </div>

        {/* Story output reports section */}
        {output && (
          <div className="lg:col-span-8">
            <OutputCard 
              output={output} 
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
