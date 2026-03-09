'use client';

interface Publisher {
  id: string;
  name: string;
  logoUrl?: string;
}

interface PublisherAssignmentProps {
  publishers: Publisher[];
  selectedIds: Set<string>;
  onToggle: (publisherId: string) => void;
  onSelectAll: () => void;
}

export function PublisherAssignment({ publishers, selectedIds, onToggle, onSelectAll }: PublisherAssignmentProps) {
  const allSelected = publishers.length > 0 && publishers.every(p => selectedIds.has(p.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">Assign to Publishers</label>
        <button
          onClick={onSelectAll}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="space-y-2">
        {publishers.map(pub => (
          <label
            key={pub.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedIds.has(pub.id)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(pub.id)}
              onChange={() => onToggle(pub.id)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            {pub.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pub.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                {pub.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{pub.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
