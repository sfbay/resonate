import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Curated demo publisher slugs (mapped to seeded publisher IDs)
const DEMO_PUBLISHERS: Record<string, string> = {
  'el-tecolote': '11111111-1111-1111-1111-111111111101',
  'mission-local': '11111111-1111-1111-1111-111111111102',
  'the-bay-view': '11111111-1111-1111-1111-111111111103',
  'sf-public-press': '11111111-1111-1111-1111-111111111104',
  '48-hills': '11111111-1111-1111-1111-111111111111',
};

export default async function DemoPublisherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publisherId = DEMO_PUBLISHERS[slug];

  if (!publisherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-fraunces text-2xl font-bold text-charcoal-900 mb-2">
            Publisher Not Found
          </h1>
          <p className="text-slate-600">This demo profile doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: publisher } = await supabase
    .from('publishers')
    .select('*')
    .eq('id', publisherId)
    .single();

  if (!publisher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Publisher data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-teal-600 text-white text-center py-2 text-sm font-medium">
        Sample Publisher Profile &mdash; <a href="/sign-up" className="underline">Join Resonate</a> to access the full platform
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            {publisher.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publisher.logo_url}
                alt={publisher.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="font-fraunces text-2xl font-bold text-charcoal-900">
                {publisher.name}
              </h1>
              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:underline"
                >
                  {publisher.website}
                </a>
              )}
            </div>
          </div>

          {publisher.description && (
            <p className="text-slate-600 mb-6">{publisher.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-slate-500">Status</div>
              <div className="font-semibold text-charcoal-900 capitalize">{publisher.status}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-slate-500">Contact</div>
              <div className="font-semibold text-charcoal-900">{publisher.contact_name || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
