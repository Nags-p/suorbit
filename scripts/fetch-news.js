const fs = require('fs');
const path = require('path');
const https = require('https');

// Categories config
const CATEGORIES = ['Technology', 'AI', 'Space', 'Science', 'Startups', 'Business'];

// Helper to pause execution (throttle Gemini API requests to stay under 15 RPM)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Unsplash images for categories to use as fallback or for mock data
const CATEGORY_IMAGES = {
  'Technology': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
  ],
  'AI': [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1680814907495-d8b8e0e7a1ad?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  ],
  'Space': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80'
  ],
  'Science': [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop&q=80'
  ],
  'Startups': [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-b813f57a32f6?w=800&auto=format&fit=crop&q=80'
  ],
  'Business': [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80'
  ]
};

// Helper: Get random image for a category
function getRandomImage(category) {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Technology'];
  return list[Math.floor(Math.random() * list.length)];
}

// Generate high quality Mock News data (local fallback)
function generateMockNews() {
  console.log("Generating high-quality mock news data...");
  const mockArticles = [];
  const now = new Date();

  const mockTemplates = {
    'Technology': [
      {
        title: "Apple Unveils Neural Glasses: The Post-Smartphone Era Officially Begins",
        summary: "Apple has announced its long-rumored Neural Glasses, a AR wearable powered by a new localized Apple Silicon chip. Running on glassOS, the device overlays context-aware AI elements directly onto the user's field of view.",
        content: "Apple today shocked the tech world by launching Neural Glasses, an ultra-lightweight augmented reality device that promises to untether users from their smartphones. Powered by the M6 chip, the glasses weigh only 75 grams and boast an 8-hour battery life. Early testers report that the spatial tracking is flawless and the contextual AI integration feels magic, showing maps, message details, and live translations contextually without blocking vision. Critics, however, raise concerns about privacy and social etiquette in public spaces.",
        source: "TechPulse",
        author: "Sarah Jenkins",
        tags: ["AR", "Hardware", "Apple", "SpatialComputing"]
      },
      {
        title: "Quantum Computing Reaches 10,000 Logical Qubits in Landmark Breakthrough",
        summary: "Physicists have successfully demonstrated error-corrected computation on a 10,000 logical qubit processor, paving the way for commercial cryptanalysis and advanced molecular simulation within the decade.",
        content: "A consortium of quantum physicists and computer scientists have achieved a historic milestone by demonstrating stable computation on a quantum computer featuring 10,000 logical qubits. By implementing advanced topological error-correction codes, the system maintained coherence for over three hours, a thousandfold increase over previous records. This breakthrough moves quantum computing out of the experimental lab and into the realm of practical application, threatening RSA encryption and promising a revolution in pharmaceutical drug discovery.",
        source: "Quantum Horizon",
        author: "Dr. Kenji Tanaka",
        tags: ["Quantum", "Physics", "Computing", "Hardware"]
      }
    ],
    'AI': [
      {
        title: "GPT-6 Achieves Human-Level Reasoning in Formal Logic and Mathematics",
        summary: "OpenAI's latest model, GPT-6, has achieved scoring parity with university professors on advanced logic, chemistry, and physics benchmarks. The model incorporates a dynamic tree-of-thought search mechanism.",
        content: "OpenAI has officially launched GPT-6, setting a new standard for artificial intelligence reasoning capabilities. Unlike its predecessors, which generated text token-by-token linearly, GPT-6 utilizes a reasoning architecture called 'LogicFlow'. This method evaluates multiple reasoning trees, running internal verification steps before presenting answers. In standard testing, GPT-6 scored 98% on the Putnam Mathematical Competition problems, indicating a deep capability to formulate logic paths rather than just mimic patterns.",
        source: "AI Chronicle",
        author: "Elena Rostov",
        tags: ["GPT6", "OpenAI", "LLM", "Reasoning"]
      },
      {
        title: "Autonomous AI Software Engineers Take Over Monotonous Legacy Migration Tasks",
        summary: "Enterprises are deploying AI agents that can read, comprehend, refactor, and migrate legacy codebases from COBOL to TypeScript in a fraction of the time.",
        content: "Legacy software migrations, long considered the bane of enterprise IT, are being transformed by autonomous AI software development agents. Companies are using platforms like DevOS and CodePilot to translate legacy systems directly. One Fortune 500 bank recently migrated their entire core banking system from COBOL to a modern microservices architecture in TypeScript over a single weekend. The AI agent identified dependencies, rewrote modules, added unit tests, and resolved compilation errors autonomously, completing a task estimated to cost $40M and take 5 years.",
        source: "DevTech Weekly",
        author: "Devin O'Connor",
        tags: ["AIAgents", "Coding", "SoftwareEngineering", "LegacyCode"]
      }
    ]
  };

  let count = 0;
  CATEGORIES.forEach(category => {
    const templates = mockTemplates[category] || [
      {
        title: `Latest developments in ${category} showcase industrial shift`,
        summary: `Analytical summary report detailing current trends and corporate shifts inside the global ${category} market.`,
        content: `The global market for ${category} experienced major shifts this quarter. Leading teams announced partnerships, venture updates, and advanced hardware implementations aimed at capturing enterprise adoption. Experts indicate that these investments will redefine standard practices over the next 18 months, triggering structural consolidation.`,
        source: "SuOrbit Editorial",
        author: "Staff Writer",
        tags: [category, "Trends"]
      }
    ];

    templates.forEach((t, i) => {
      count++;
      const id = `article-${category.toLowerCase().substring(0, 3)}-${String(i + 1).padStart(3, '0')}`;
      const date = new Date(now);
      date.setHours(date.getHours() - (count * 4));
      
      const sentences = t.content.split('. ').map(s => s.trim()).filter(s => s.length > 0);
      const keyTakeaways = [
        sentences[0] || t.summary,
        sentences[1] || "A major technical milestone for the sector.",
        "Industry experts predict long-term changes to market dynamics."
      ];

      mockArticles.push({
        id: id,
        title: t.title,
        summary: t.summary,
        content: t.content,
        keyTakeaways: keyTakeaways,
        source: t.source,
        author: t.author,
        publishedAt: date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].substring(0, 5),
        category: category,
        image: CATEGORY_IMAGES[category] ? CATEGORY_IMAGES[category][i % CATEGORY_IMAGES[category].length] : getRandomImage(category),
        originalUrl: `https://example.com/mock-news/${id}`,
        tags: t.tags,
        readingTime: `${Math.ceil(t.content.split(' ').length / 200) + 1} min`
      });
    });
  });

  return mockArticles;
}

// Call Gemini API to write human news
function callGeminiAPI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Gemini API error (Status ${res.statusCode}): ${body}`));
          return;
        }
        try {
          const parsed = JSON.parse(body);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            let textResult = parsed.candidates[0].content.parts[0].text.trim();
            
            // Clean up markdown block wrappers if model returns them despite request
            if (textResult.startsWith('```')) {
              textResult = textResult.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            }

            const jsonResponse = JSON.parse(textResult);
            resolve(jsonResponse);
          } else {
            reject(new Error("Unexpected Gemini response structure: " + body));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Gemini output as JSON: ${e.message}. Raw output: ${body}`));
        }
      });
    });

    req.on('error', e => reject(e));
    req.write(postData);
    req.end();
  });
}

// Fetch live news from NewsAPI
function fetchLiveNews(apiKey) {
  console.log("Querying NewsAPI v2/everything...");
  
  // Search terms mapping for categories
  const queryMap = {
    'Technology': 'technology AND (software OR hardware OR gadgets OR silicon)',
    'AI': '"artificial intelligence" OR "machine learning" OR "deep learning" OR "GPT" OR "LLM"',
    'Space': 'spaceflight OR NASA OR SpaceX OR astronomy OR cosmos OR rocket',
    'Science': 'science AND (physics OR biology OR genetics OR fusion OR chemistry)',
    'Startups': 'startups OR entrepreneurship OR "venture capital"',
    'Business': 'business AND (economy OR markets OR finance OR corporate)'
  };

  const categoryPromises = CATEGORIES.map(category => {
    return new Promise((resolve) => {
      const q = encodeURIComponent(queryMap[category]);
      const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=15&language=en&apiKey=${apiKey}`;

      const options = {
        headers: { 'User-Agent': 'SuOrbitNewsAggregator/1.0' }
      };

      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.status === 'ok') {
              // Get the top 5 articles per category from NewsAPI
              resolve({ category, articles: parsed.articles.slice(0, 5) });
            } else {
              console.error(`NewsAPI Error (${category}): ${parsed.message}`);
              resolve({ category, articles: [] });
            }
          } catch (e) {
            console.error(`Failed to parse NewsAPI for ${category}: ${e.message}`);
            resolve({ category, articles: [] });
          }
        });
      }).on('error', e => {
        console.error(`Request failed for category ${category}: ${e.message}`);
        resolve({ category, articles: [] });
      });
    });
  });

  return Promise.all(categoryPromises);
}

// Orchestrator
async function run() {
  const newsApiKey = process.env.NEWS_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!newsApiKey || newsApiKey.trim() === '') {
    console.log("Missing NEWS_API_KEY environment variable. Falling back to mock data.");
    writeOutData(generateMockNews());
    return;
  }

  // Fetch live articles list
  let rawCategoryData = [];
  try {
    rawCategoryData = await fetchLiveNews(newsApiKey);
  } catch (e) {
    console.error("Failed fetching news: " + e.message + ". Falling back to mock data.");
    writeOutData(generateMockNews());
    return;
  }

  console.log("Live news headers retrieved. Processing articles...");

  // Select top 3 articles per category (18 total) to process through Gemini
  const articlesToProcess = [];
  rawCategoryData.forEach(catGroup => {
    const { category, articles } = catGroup;
    let count = 0;
    for (const item of articles) {
      if (!item.title || item.title.includes('[Removed]') || !item.description || !item.url) continue;
      
      articlesToProcess.push({
        category,
        original: item,
        image: item.urlToImage || getRandomImage(category)
      });
      count++;
      if (count >= 3) break; // Limit to 3 articles per category
    }
  });

  if (articlesToProcess.length === 0) {
    console.log("No valid live articles found. Generating mock news.");
    writeOutData(generateMockNews());
    return;
  }

  console.log(`Processing ${articlesToProcess.length} articles through Gemini API...`);
  const finalArticles = [];

  for (let idx = 0; idx < articlesToProcess.length; idx++) {
    const item = articlesToProcess[idx];
    const { category, original, image } = item;
    
    console.log(`[${idx+1}/${articlesToProcess.length}] Processing article: "${original.title.substring(0, 50)}..." in ${category}`);

    const id = `article-${category.toLowerCase().substring(0, 3)}-${Date.now().toString(36)}-${idx.toString().padStart(3, '0')}`;
    
    // Construct formatting dates
    const publishedDate = new Date(original.publishedAt);
    const formattedDate = isNaN(publishedDate.getTime()) 
      ? new Date().toISOString().split('T')[0] + ' 12:00' 
      : publishedDate.toISOString().split('T')[0] + ' ' + publishedDate.toTimeString().split(' ')[0].substring(0, 5);

    // If Gemini key is set, call Gemini to generate human news content
    if (geminiApiKey && geminiApiKey.trim() !== '') {
      const prompt = `You are a professional journalist at a premium technology and science publication (like The Verge, Wired, or TechCrunch). 
Rewrite and expand the following news reporting snippet into a complete, highly engaging, human-written news article of 250 to 350 words.
Do not use typical artificial intelligence patterns or robotic transitions. Make it sound written by a human. Ensure paragraphs flow naturally.

Also generate:
1. A rewritten, punchy, human-sounding headline (title).
2. A concise 2-sentence summary of the article (AI summary).
3. Exactly three bullet points of key takeaways.

Input Article Info:
Category: ${category}
Source: ${original.source ? original.source.name : 'Reporter'}
Original Title: ${original.title}
Original Description: ${original.description}
Original Snippet/Content: ${original.content || original.description}

Provide the output in JSON format matching this schema:
{
  "title": "catchy headline",
  "summary": "2-sentence summary",
  "content": "Full detailed rewritten article body. Separate paragraphs with double newlines.",
  "keyTakeaways": ["key takeaway 1", "key takeaway 2", "key takeaway 3"]
}
`;

      try {
        // Enforce throttling: wait 4 seconds between requests to respect 15 RPM limits on free keys
        if (idx > 0) {
          console.log("Sleeping 4 seconds to respect Gemini rate limits...");
          await sleep(4000);
        }

        const geminiResult = await callGeminiAPI(prompt, geminiApiKey);
        
        // Calculate dynamic reading time based on rewritten content word count
        const wordCount = (geminiResult.content || "").split(/\s+/).length;
        const readingTime = `${Math.max(2, Math.ceil(wordCount / 200))} min`;

        finalArticles.push({
          id,
          title: geminiResult.title || original.title,
          summary: geminiResult.summary || original.description,
          content: geminiResult.content || original.content || original.description,
          keyTakeaways: geminiResult.keyTakeaways && geminiResult.keyTakeaways.length > 0 ? geminiResult.keyTakeaways : [original.description],
          source: original.source ? original.source.name : 'Global News',
          author: original.author || 'Staff Writer',
          publishedAt: formattedDate,
          category,
          image,
          originalUrl: original.url,
          tags: [category, ...(original.title.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 5).slice(0, 2))],
          readingTime
        });

        console.log(`--> Successfully generated human article via Gemini.`);
      } catch (geminiError) {
        console.error(`--> Gemini failed for this article: ${geminiError.message}. Using NewsAPI fallback.`);
        // Fallback to basic NewsAPI parsing
        finalArticles.push(createFallbackArticle(id, original, category, image, formattedDate));
      }
    } else {
      // No Gemini Key - Fallback to basic NewsAPI details immediately
      finalArticles.push(createFallbackArticle(id, original, category, image, formattedDate));
    }
  }

  // Write files
  writeOutData(finalArticles);
}

// Fallback creator
function createFallbackArticle(id, original, category, image, formattedDate) {
  const words = (original.content || original.description || "").split(/\s+/).length;
  const readingTime = `${Math.max(2, Math.ceil(words / 200))} min`;
  
  return {
    id,
    title: original.title,
    summary: original.description,
    content: original.content || original.description,
    keyTakeaways: [
      original.description,
      "Live update from the fields of " + category + ".",
      "Review the original publisher's link below for detailed context."
    ],
    source: original.source ? original.source.name : 'Unknown',
    author: original.author || 'Staff Writer',
    publishedAt: formattedDate,
    category,
    image,
    originalUrl: original.url,
    tags: [category],
    readingTime
  };
}

// Write JSON files utility
function writeOutData(articles) {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Sort by date descending
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Write category split files
  CATEGORIES.forEach(category => {
    const categoryArticles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    const filePath = path.join(dataDir, `${category.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(categoryArticles, null, 2), 'utf8');
    console.log(`Saved ${categoryArticles.length} human-AI articles to ${filePath}`);
  });

  // Write main index file
  const mainFilePath = path.join(dataDir, 'news.json');
  fs.writeFileSync(mainFilePath, JSON.stringify(articles, null, 2), 'utf8');
  console.log(`Saved unified database (${articles.length} entries) to ${mainFilePath}`);
}

run();
