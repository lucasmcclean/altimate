const nodesTemp = [
  {
    "changeType": "img_alt_added",
    "querySelector": "img.hero-image",
    "replacementHTML": "<img class='hero-image' src='hero.jpg' alt='Company headquarters at sunset'>",
    "connections": [2, 5],
    "descriptionText": "Added descriptive alt text to hero image for accessibility."
  },
  {
    "changeType": "img_alt_altered",
    "querySelector": "img.product-thumbnail",
    "replacementHTML": "<img class='product-thumbnail' src='product.jpg' alt='Blue wireless headphones with noise cancellation'>",
    "connections": [1, 3],
    "descriptionText": "Improved alt text on product image for better screen reader experience."
  },
  {
    "changeType": "img_contrast_altered",
    "querySelector": "img.logo",
    "replacementHTML": "<img class='logo' src='logo-high-contrast.png' alt='Company logo'>",
    "connections": [2, 4],
    "descriptionText": "Replaced logo with higher-contrast version for better visibility."
  },
  {
    "changeType": "page_contrast_altered",
    "querySelector": "body",
    "replacementHTML": "<body class='high-contrast-theme'>",
    "connections": [3, 6],
    "descriptionText": "Applied high-contrast theme to entire page for improved readability."
  },
  {
    "changeType": "page_navigation_altered",
    "querySelector": "nav.main-nav",
    "replacementHTML": "<nav class='main-nav' aria-label='Main'><ul><li><a href='/'>Home</a></li><li><a href='/about'>About</a></li></ul></nav>",
    "connections": [1, 7],
    "descriptionText": "Restructured main navigation with proper ARIA labels and semantic markup."
  },
  {
    "changeType": "page_skip_to_main_added",
    "querySelector": "body",
    "replacementHTML": "<a class='skip-link' href='#main-content'>Skip to main content</a>",
    "connections": [4, 8],
    "descriptionText": "Added skip-to-main-content link at top of page for keyboard users."
  },
  {
    "changeType": "img_alt_added",
    "querySelector": "img.team-photo",
    "replacementHTML": "<img class='team-photo' src='team.jpg' alt='Our diverse engineering team smiling in the office'>",
    "connections": [5, 9],
    "descriptionText": "Added meaningful alt text to team photo."
  },
  {
    "changeType": "img_alt_altered",
    "querySelector": "img.icon-search",
    "replacementHTML": "<img class='icon-search' src='search-icon.svg' alt='Search'>",
    "connections": [6, 10],
    "descriptionText": "Updated alt text on search icon from 'icon' to 'Search'."
  },
  {
    "changeType": "img_contrast_altered",
    "querySelector": "img.chart-data",
    "replacementHTML": "<img class='chart-data' src='chart-high-contrast.png' alt='Sales growth chart Q1–Q4'>",
    "connections": [7, 11],
    "descriptionText": "Enhanced contrast of data visualization image for accessibility compliance."
  },
  {
    "changeType": "page_contrast_altered",
    "querySelector": ".content-area",
    "replacementHTML": "<div class='content-area high-contrast'>",
    "connections": [8, 12],
    "descriptionText": "Increased text-background contrast in main content area."
  },
  {
    "changeType": "page_navigation_altered",
    "querySelector": "footer nav",
    "replacementHTML": "<nav aria-label='Footer'><ul><li><a href='/privacy'>Privacy</a></li><li><a href='/terms'>Terms</a></li></ul></nav>",
    "connections": [9, 13],
    "descriptionText": "Improved footer navigation semantics and labeling."
  },
  {
    "changeType": "page_skip_to_main_added",
    "querySelector": "#top-bar",
    "replacementHTML": "<div id='top-bar'><a class='skip-link' href='#primary'>Skip to primary content</a></div>",
    "connections": [10, 14],
    "descriptionText": "Inserted skip link just after top utility bar."
  },
  {
    "changeType": "img_alt_added",
    "querySelector": "img.diagram-accessibility",
    "replacementHTML": "<img src='accessibility-diagram.png' alt='Flowchart showing screen reader navigation path through page elements'>",
    "connections": [11, 15],
    "descriptionText": "Added detailed alt text to accessibility diagram."
  },
  {
    "changeType": "img_alt_altered",
    "querySelector": "img.user-avatar",
    "replacementHTML": "<img class='user-avatar' src='avatar.jpg' alt='Profile picture of Alex Johnson'>",
    "connections": [12, 16],
    "descriptionText": "Replaced generic 'user image' alt text with user's actual name."
  },
  {
    "changeType": "img_contrast_altered",
    "querySelector": "img.button-icon",
    "replacementHTML": "<img class='button-icon' src='download-icon-hc.svg' alt='Download'>",
    "connections": [13, 17],
    "descriptionText": "Updated icon image to meet minimum contrast ratio requirements."
  },
  {
    "changeType": "page_contrast_altered",
    "querySelector": ".form-group label",
    "replacementHTML": "<label class='form-label high-contrast'>Email Address</label>",
    "connections": [14, 18],
    "descriptionText": "Adjusted label text color to improve contrast against background."
  },
  {
    "changeType": "page_navigation_altered",
    "querySelector": ".breadcrumb",
    "replacementHTML": "<nav aria-label='Breadcrumb'><ol><li><a href='/'>Home</a></li><li>Products</li></ol></nav>",
    "connections": [15, 19],
    "descriptionText": "Converted breadcrumb into proper navigation landmark with ARIA label."
  },
  {
    "changeType": "page_skip_to_main_added",
    "querySelector": "header",
    "replacementHTML": "<header><a class='skip-link visually-hidden' href='#content'>Skip to content</a>",
    "connections": [16, 20],
    "descriptionText": "Added visually hidden skip link at start of header."
  },
  {
    "changeType": "img_alt_added",
    "querySelector": "img.infographic",
    "replacementHTML": "<img src='infographic.png' alt='Step-by-step guide to filing a support ticket, showing 4 stages with icons'>",
    "connections": [17, 1],
    "descriptionText": "Provided comprehensive alt text for complex infographic."
  },
  {
    "changeType": "img_alt_altered",
    "querySelector": "img.logo-footer",
    "replacementHTML": "<img class='logo-footer' src='footer-logo.svg' alt='Acme Inc. – Building accessible digital experiences since 2010'>",
    "connections": [18, 2],
    "descriptionText": "Enhanced logo alt text to include company tagline for context."
  }
]

export default nodesTemp;
