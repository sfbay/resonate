'use client';

/**
 * Publisher Schedule Page (City-Scoped)
 *
 * Calendar/list view of scheduled posts with create/edit form.
 * Fetches from the scheduled_posts table via Supabase.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCity } from '@/lib/geo/city-context';
import { getSupabaseClient } from '@/lib/db/supabase';
import { ScheduleCalendar } from '@/components/publisher/schedule/ScheduleCalendar';
import { PostForm } from '@/components/publisher/schedule/PostForm';
import type { ScheduledPost } from '@/components/publisher/schedule/ScheduledPostCard';

export default function SchedulePage() {
  const { city, getPath } = useCity();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [publisherId, setPublisherId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Get first active publisher (same pattern as usePublisherData — oldest first for demo consistency)
      const { data: publishers } = await supabase
        .from('publishers')
        .select('id')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1);

      if (!publishers || publishers.length === 0) {
        setError('No publisher found');
        return;
      }

      const pubId = (publishers[0] as { id: string }).id;
      setPublisherId(pubId);

      // Fetch scheduled posts
      const { data: scheduledPosts, error: postsError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('publisher_id', pubId)
        .order('scheduled_for', { ascending: true });

      if (postsError) throw new Error(postsError.message);

      setPosts((scheduledPosts || []) as unknown as ScheduledPost[]);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePost = async (data: {
    platform: string;
    content: string;
    scheduled_for: string;
    status: string;
  }) => {
    if (!publisherId) return;

    try {
      const supabase = getSupabaseClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('scheduled_posts')
        .insert({
          publisher_id: publisherId,
          platform: data.platform,
          content: data.content,
          scheduled_for: data.scheduled_for,
          status: data.status,
        });

      if (insertError) throw new Error(insertError.message);

      setShowForm(false);
      setEditingPost(null);
      fetchData();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  // Stats summary
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const published = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={getPath('/publisher/dashboard')} className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Post Schedule</h1>
              <p className="text-sm text-gray-500">Plan and schedule your content for {city.name}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingPost(null); setShowForm(true); }}
            className="btn btn-coral text-sm py-2 px-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Scheduled', value: scheduled, color: 'text-blue-600' },
            { label: 'Drafts', value: drafts, color: 'text-gray-600' },
            { label: 'Published', value: published, color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchData} className="mt-3 text-sm text-red-500 underline">
              Try again
            </button>
          </div>
        )}

        {/* Main content */}
        {!isLoading && !error && (
          <div className="flex gap-6">
            {/* Calendar */}
            <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${showForm ? 'flex-1' : 'w-full'}`}>
              <ScheduleCalendar posts={posts} onEditPost={handleEditPost} />
            </div>

            {/* Form sidebar */}
            {showForm && (
              <div className="w-[360px] shrink-0">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingPost ? 'Edit Post' : 'New Post'}
                  </h2>
                  <PostForm
                    post={editingPost}
                    onSubmit={handleCreatePost}
                    onCancel={() => { setShowForm(false); setEditingPost(null); }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts scheduled yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start planning your content calendar</p>
            <button
              onClick={() => { setEditingPost(null); setShowForm(true); }}
              className="btn btn-coral text-sm py-2 px-4"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
