import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .advertisement, .ad, #ad, .sidebar, .menu, .nav').remove();

    // Try to get article content in order of specificity
    let content = '';

    // Try Open Graph / meta description first
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';

    // Try article-specific selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-body',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      'main',
      '#content',
      '.content',
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) break;
      }
    }

    // Fallback to body paragraphs
    if (content.length < 200) {
      const paragraphs: string[] = [];
      $('p').each((_i, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join('\n\n');
    }

    // Build final text
    const finalParts = [];
    if (title) finalParts.push(`Title: ${title}`);
    if (ogDescription) finalParts.push(`Description: ${ogDescription}`);
    else if (metaDescription) finalParts.push(`Description: ${metaDescription}`);
    if (content) finalParts.push(`\nContent:\n${content}`);

    const result = finalParts.join('\n');

    // Limit to ~5000 chars for API efficiency
    return result.substring(0, 5000);
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to extract content from URL: ${url}`);
  }
}
