const signatures = {
  "articles": {
    "discipline-dividend-dreams": {
      "title": "Discipline is the Dividend of Dreams",
      "category": "Motivation",
      "readingTime": "4 min read",
      "excerpt": "Dreams become serious when discipline turns intention into daily evidence.",
      "image": "/art/cover-1.svg",
      "body": "",
      "published": true
    },
    "mindset-builder": {
      "title": "The Mindset of a Builder",
      "category": "Mindset",
      "readingTime": "5 min read",
      "excerpt": "Builders think in seasons, systems, and service. They keep improving while others wait for permission.",
      "image": "/art/cover-2.svg",
      "body": "",
      "published": true
    },
    "systems-create-freedom": {
      "title": "Systems Create Freedom",
      "category": "Business growth",
      "readingTime": "3 min read",
      "excerpt": "Freedom is not the absence of structure. It is the reward of structure that works.",
      "image": "/art/cover-3.svg",
      "body": "",
      "published": true
    },
    "start-small-think-long-term": {
      "title": "Start Small. Think Long Term.",
      "category": "Entrepreneurship",
      "readingTime": "4 min read",
      "excerpt": "Small starts build momentum when they are connected to a larger vision and repeated with focus.",
      "image": "/art/cover-4.svg",
      "body": "",
      "published": true
    },
    "clarity-creates-momentum": {
      "title": "Clarity Creates Momentum",
      "category": "Clarity",
      "readingTime": "4 min read",
      "excerpt": "The next step becomes easier when the destination and the reason are clear.",
      "image": "/art/cover-5.svg",
      "body": "",
      "published": true
    },
    "leadership-is-influence": {
      "title": "Leadership is Influence",
      "category": "Leadership",
      "readingTime": "5 min read",
      "excerpt": "Leadership begins with the ability to model what you ask others to become.",
      "image": "/art/cover-6.svg",
      "body": "",
      "published": true
    }
  },
  "resources": {
    "clarity-creates-momentum-pdf": {
      "title": "Clarity Creates Momentum",
      "format": "PDF",
      "price": 0,
      "description": "A practical reflection guide for choosing the next right step with confidence.",
      "url": "",
      "published": true
    },
    "builders-daily-checklist": {
      "title": "The Builder's Daily Checklist",
      "format": "PDF",
      "price": 0,
      "description": "A daily page for focus, priorities, habits, and progress tracking.",
      "url": "",
      "published": true
    },
    "goal-setting-worksheet": {
      "title": "Goal Setting Worksheet",
      "format": "PDF",
      "price": 0,
      "description": "A clean worksheet for turning broad goals into measurable weekly action.",
      "url": "",
      "published": true
    },
    "business-idea-validator": {
      "title": "Business Idea Validator",
      "format": "PDF",
      "price": 0,
      "description": "A simple filter for testing demand, audience, value, and execution readiness.",
      "url": "",
      "published": true
    }
  },
  "books": {
    "atomic-habits": {
      "title": "Atomic Habits",
      "author": "James Clear",
      "kind": "recommended",
      "cover": "/books/atomic-habits.jpg",
      "description": "A practical look at how small, repeatable changes shape our habits. A starting point for thinking about consistency rather than relying on motivation.",
      "url": "",
      "sample": true,
      "published": true
    },
    "deep-work": {
      "title": "Deep Work",
      "author": "Cal Newport",
      "kind": "recommended",
      "cover": "/books/deep-work.jpg",
      "description": "On making time for focused work in a distracted day. Useful for thinking through what deserves your attention and what can wait.",
      "url": "",
      "sample": true,
      "published": true
    },
    "meditations": {
      "title": "Meditations",
      "author": "Marcus Aurelius",
      "kind": "recommended",
      "cover": "/books/meditations.jpg",
      "description": "Personal reflections on judgement, responsibility, and how to respond to difficulty. A book to read slowly, a few pages at a time.",
      "url": "",
      "sample": true,
      "published": true
    }
  }
};

const defaults = {
  "articles": {
    "author": "",
    "date": "",
    "bodyHtml": "",
    "seoTitle": "",
    "seoDescription": ""
  },
  "resources": {
    "author": "",
    "pages": "",
    "featured": false,
    "cover": ""
  },
  "books": {
    "coverAlt": "",
    "coverBackup": "",
    "featured": false
  }
};

// Exact historical records only. Preserve records an administrator has changed.
export function removeLegacyPlaceholders(content) {
  const result = { ...content };
  for (const [key, records] of Object.entries(signatures)) {
    if (!Array.isArray(content[key])) continue;
    result[key] = content[key].filter((item) => {
      if (!Object.hasOwn(records, item.id)) return true;
      const original = { id: item.id, ...records[item.id] };
      const normalized = { ...defaults[key], ...original };
      const unchanged = Object.entries(original).every(([field, value]) => item[field] === value) &&
        Object.entries(item).every(([field, value]) => Object.hasOwn(normalized, field) && normalized[field] === value);
      return !unchanged;
    });
  }
  return result;
}
