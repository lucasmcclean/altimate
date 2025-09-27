const nodes = [
  {
    "changeType": "REPLACE",
    "querySelector": "#header",
    "replacementHTML": "<header><h1>Updated Header</h1></header>",
    "connections": [2, 5],
    "descriptionText": "Replaces the main header with a new styled version."
  },
  {
    "changeType": "INSERT_AFTER",
    "querySelector": ".sidebar",
    "replacementHTML": "<div class='ad-banner'>Advertisement</div>",
    "connections": [1, 3],
    "descriptionText": "Inserts an ad banner after the sidebar."
  },
  {
    "changeType": "REMOVE",
    "querySelector": ".deprecated-notice",
    "replacementHTML": "",
    "connections": [2, 4],
    "descriptionText": "Removes outdated deprecation notices."
  },
  {
    "changeType": "REPLACE",
    "querySelector": "nav ul",
    "replacementHTML": "<ul><li><a href='/home'>Home</a></li><li><a href='/about'>About</a></li></ul>",
    "connections": [3, 6],
    "descriptionText": "Updates navigation menu items."
  },
  {
    "changeType": "INSERT_BEFORE",
    "querySelector": "#footer",
    "replacementHTML": "<div class='legal-notice'>© 2024 Example Corp</div>",
    "connections": [1, 7],
    "descriptionText": "Adds a legal notice before the footer."
  },
  {
    "changeType": "REPLACE",
    "querySelector": ".hero-banner img",
    "replacementHTML": "<img src='/new-hero.jpg' alt='New Hero Image'>",
    "connections": [4, 8],
    "descriptionText": "Swaps hero image with seasonal promotion."
  },
  {
    "changeType": "REMOVE",
    "querySelector": "#beta-badge",
    "replacementHTML": "",
    "connections": [5, 9],
    "descriptionText": "Removes beta label now that feature is stable."
  },
  {
    "changeType": "INSERT_AFTER",
    "querySelector": ".product-list",
    "replacementHTML": "<div class='promo-section'>Limited Time Offer!</div>",
    "connections": [6, 10],
    "descriptionText": "Adds promotional section after product listings."
  },
  {
    "changeType": "REPLACE",
    "querySelector": "form#contact",
    "replacementHTML": "<form id='contact'><input type='email' placeholder='Your Email'><button>Subscribe</button></form>",
    "connections": [7, 11],
    "descriptionText": "Simplifies contact form to email subscription."
  },
  {
    "changeType": "INSERT_BEFORE",
    "querySelector": ".comments-section",
    "replacementHTML": "<h3>Join the Discussion</h3>",
    "connections": [8, 12],
    "descriptionText": "Adds heading before comments area."
  },
  {
    "changeType": "REMOVE",
    "querySelector": ".old-tracking-pixel",
    "replacementHTML": "",
    "connections": [9, 13],
    "descriptionText": "Removes legacy analytics tracking code."
  },
  {
    "changeType": "REPLACE",
    "querySelector": ".user-avatar",
    "replacementHTML": "<img class='user-avatar' src='/default-avatar.png' alt='User Avatar'>",
    "connections": [10, 14],
    "descriptionText": "Sets default avatar for users without profile picture."
  },
  {
    "changeType": "INSERT_AFTER",
    "querySelector": "#main-content",
    "replacementHTML": "<aside class='related-articles'>Related Posts</aside>",
    "connections": [11, 15],
    "descriptionText": "Adds related articles sidebar after main content."
  },
  {
    "changeType": "REPLACE",
    "querySelector": "button.cta-primary",
    "replacementHTML": "<button class='cta-primary'>Get Started Now</button>",
    "connections": [12, 16],
    "descriptionText": "Updates primary call-to-action button text."
  },
  {
    "changeType": "REMOVE",
    "querySelector": ".debug-info",
    "replacementHTML": "",
    "connections": [13, 17],
    "descriptionText": "Removes debug information from production build."
  },
  {
    "changeType": "INSERT_BEFORE",
    "querySelector": ".pricing-table",
    "replacementHTML": "<h2>Choose Your Plan</h2>",
    "connections": [14, 18],
    "descriptionText": "Adds heading before pricing options."
  },
  {
    "changeType": "REPLACE",
    "querySelector": ".social-links",
    "replacementHTML": "<div class='social-links'><a href='https://twitter.com'>Twitter</a><a href='https://linkedin.com'>LinkedIn</a></div>",
    "connections": [15, 19],
    "descriptionText": "Refreshes social media links."
  },
  {
    "changeType": "INSERT_AFTER",
    "querySelector": "article.blog-post",
    "replacementHTML": "<div class='author-bio'>Written by Jane Doe</div>",
    "connections": [16, 20],
    "descriptionText": "Adds author bio after each blog post."
  },
  {
    "changeType": "REMOVE",
    "querySelector": "#temp-banner",
    "replacementHTML": "",
    "connections": [17, 1],
    "descriptionText": "Removes temporary event banner after campaign ends."
  },
  {
    "changeType": "REPLACE",
    "querySelector": ".mobile-menu-toggle",
    "replacementHTML": "<button class='mobile-menu-toggle' aria-label='Toggle Menu'>☰</button>",
    "connections": [18, 2],
    "descriptionText": "Improves accessibility of mobile menu toggle."
  }
]

export default nodes;
