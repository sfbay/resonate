import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { isAIEnabled, generateCompletion } from '@/lib/ai';

interface AssistRequest {
  formatKey: string;
  platform: string;
  placement: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const body = (await request.json()) as AssistRequest;

  if (!body.formatKey || !body.platform) {
    return NextResponse.json(
      { error: 'formatKey and platform are required' },
      { status: 400 }
    );
  }

  const authResult = await authenticateRequest();
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  // Fetch campaign brief
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: campaign, error: campaignError } = await (supabase as any)
    .from('campaigns')
    .select('name, description, department, target_neighborhoods, target_languages, target_communities, goal, source')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Fetch matching templates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templates } = await (supabase as any)
    .from('unit_templates')
    .select('id, name, category, tier')
    .eq('format_key', body.formatKey)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const templateList = (templates || []).map((t: Record<string, unknown>) =>
    `- "${t.name}" (${t.category}, ${t.tier})`
  ).join('\n');

  // Check if AI is available
  if (!isAIEnabled()) {
    return NextResponse.json({
      recommendedTemplateId: templates?.[0]?.id || null,
      headline: '',
      bodyText: '',
      ctaText: 'Learn More',
      hashtags: [],
      reasoning: 'AI is not configured. Defaulting to first template.',
      aiGenerated: false,
    });
  }

  // Build prompt
  const systemPrompt = `You are a creative copywriter for Resonate, a community media advertising marketplace. You write compelling, culturally sensitive ad copy for local community outreach campaigns. Your copy should be clear, authentic, and appropriate for the target community.

Return ONLY valid JSON with this exact structure:
{
  "recommendedTemplateName": "exact template name from the list",
  "headline": "compelling headline (max 60 chars)",
  "bodyText": "engaging body copy (max 200 chars)",
  "ctaText": "short CTA (max 20 chars)",
  "hashtags": ["tag1", "tag2", "tag3"],
  "reasoning": "one sentence explaining why you chose this template and approach"
}`;

  const userPrompt = `Campaign: ${campaign.name}
Description: ${campaign.description || 'Not provided'}
Department/Source: ${campaign.department || campaign.source || 'Not specified'}
Goal: ${campaign.goal || 'General outreach'}
Target neighborhoods: ${(campaign.target_neighborhoods || []).join(', ') || 'Citywide'}
Target languages: ${(campaign.target_languages || []).join(', ') || 'English'}
Target communities: ${(campaign.target_communities || []).join(', ') || 'General'}
Format: ${body.formatKey} on ${body.platform} (${body.placement})

Available templates:
${templateList || 'No templates available'}

Generate compelling ad copy for this campaign and recommend the best template.`;

  try {
    const response = await generateCompletion({
      systemPrompt,
      userPrompt,
      maxTokens: 500,
    });

    // Parse AI response
    const text = response.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const generated = JSON.parse(jsonMatch[0]);

    // Match recommended template name to ID
    const recommendedTemplate = (templates || []).find(
      (t: Record<string, unknown>) =>
        (t.name as string).toLowerCase() === (generated.recommendedTemplateName || '').toLowerCase()
    );

    return NextResponse.json({
      recommendedTemplateId: recommendedTemplate?.id || templates?.[0]?.id || null,
      headline: generated.headline || '',
      bodyText: generated.bodyText || '',
      ctaText: generated.ctaText || 'Learn More',
      hashtags: generated.hashtags || [],
      reasoning: generated.reasoning || '',
      aiGenerated: true,
    });
  } catch (err) {
    console.error('AI assist error:', err);
    // Graceful fallback
    return NextResponse.json({
      recommendedTemplateId: templates?.[0]?.id || null,
      headline: '',
      bodyText: '',
      ctaText: 'Learn More',
      hashtags: [],
      reasoning: 'AI generation failed. Please write your own copy or try again.',
      aiGenerated: false,
    });
  }
}
