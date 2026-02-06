'use client';

/**
 * ScheduleCalendar
 *
 * Week-view calendar grid showing scheduled posts.
 * Supports week/list toggle and visual day slots.
 */

import { useState, useMemo } from 'react';
import { ScheduledPostCard, type ScheduledPost } from './ScheduledPostCard';

interface ScheduleCalendarProps {
  posts: ScheduledPost[];
  onEditPost?: (post: ScheduledPost) => void;
}

type ViewMode = 'week' | 'list';

function getWeekDays(referenceDate: Date): Date[] {
  const start = new Date(referenceDate);
  // Go to Monday of this week
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatDayHeader(date: Date): { dayName: string; dayNum: string } {
  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: date.getDate().toString(),
  };
}

export function ScheduleCalendar({ posts, onEditPost }: ScheduleCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);

  const referenceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
  }, [weekDays]);

  // Group posts by day
  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const post of posts) {
      const postDate = new Date(post.scheduled_for);
      const key = postDate.toISOString().split('T')[0];
      const existing = map.get(key) || [];
      existing.push(post);
      map.set(key, existing);
    }
    // Sort posts within each day by time
    for (const [key, dayPosts] of map) {
      map.set(key, dayPosts.sort((a, b) =>
        new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      ));
    }
    return map;
  }, [posts]);

  // List view: all posts sorted chronologically
  const sortedPosts = useMemo(() =>
    [...posts].sort((a, b) =>
      new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
    ),
    [posts]
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Previous week"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Next week"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-coral-500 hover:text-coral-600 font-medium ml-1"
            >
              Today
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['week', 'list'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Week view */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const { dayName, dayNum } = formatDayHeader(day);
            const key = day.toISOString().split('T')[0];
            const dayPosts = postsByDay.get(key) || [];
            const today = isToday(day);

            return (
              <div key={key} className="min-h-[140px]">
                {/* Day header */}
                <div className={`text-center mb-2 pb-2 border-b ${today ? 'border-coral-200' : 'border-gray-100'}`}>
                  <div className="text-xs text-gray-400 uppercase">{dayName}</div>
                  <div className={`text-lg font-semibold ${
                    today
                      ? 'text-coral-500'
                      : 'text-gray-700'
                  }`}>
                    {dayNum}
                  </div>
                </div>

                {/* Posts for this day */}
                <div className="space-y-1.5">
                  {dayPosts.map((post) => (
                    <DaySlotPost key={post.id} post={post} onClick={() => onEditPost?.(post)} />
                  ))}
                  {dayPosts.length === 0 && (
                    <div className="text-xs text-gray-300 text-center py-4">
                      No posts
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No scheduled posts yet</p>
            </div>
          ) : (
            sortedPosts.map((post) => (
              <ScheduledPostCard key={post.id} post={post} onEdit={onEditPost} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Compact post chip for week view day slots */
function DaySlotPost({ post, onClick }: { post: ScheduledPost; onClick: () => void }) {
  const statusDot: Record<string, string> = {
    draft: 'bg-gray-400',
    scheduled: 'bg-blue-500',
    published: 'bg-green-500',
    failed: 'bg-red-500',
  };

  const time = new Date(post.scheduled_for).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[post.status] || statusDot.draft}`} />
        <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
      </div>
      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-tight">
        {post.content.slice(0, 60)}{post.content.length > 60 ? '...' : ''}
      </p>
    </button>
  );
}
