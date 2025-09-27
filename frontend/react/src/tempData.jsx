const ChangeType = {
  REPLACE: 'REPLACE',
  INSERT: 'INSERT',
  DELETE: 'DELETE',
  MODIFY: 'MODIFY',
  APPEND: 'APPEND'
};

// Create a list of Node objects
let nodes = [
  {
    changeType: ChangeType.REPLACE,
    querySelector: '.header-title',
    replacementHTML: '<h1 class="new-title">Updated Header</h1>',
    connections: [[0, 1], [1, 2]],
    descriptionText: 'Replace main header with updated styling'
  },
  {
    changeType: ChangeType.INSERT,
    querySelector: '#content-area',
    replacementHTML: '<div class="alert alert-info">New notification banner</div>',
    connections: [[2, 3]],
    descriptionText: 'Insert notification banner at top of content area'
  },
  {
    changeType: ChangeType.MODIFY,
    querySelector: '.sidebar ul',
    replacementHTML: '<ul class="nav-list"><li><a href="/home">Home</a></li><li><a href="/about">About</a></li></ul>',
    connections: [[1, 3], [3, 4]],
    descriptionText: 'Update sidebar navigation with new menu items'
  },
  {
    changeType: ChangeType.DELETE,
    querySelector: '.deprecated-widget',
    replacementHTML: '',
    connections: [[0, 4]],
    descriptionText: 'Remove deprecated widget from layout'
  },
  {
    changeType: ChangeType.APPEND,
    querySelector: 'footer',
    replacementHTML: '<p class="copyright">&copy; 2025 Company Name. All rights reserved.</p>',
    connections: [[4, 5], [2, 5]],
    descriptionText: 'Add copyright notice to footer'
  },
  {
    changeType: ChangeType.REPLACE,
    querySelector: '.btn-primary',
    replacementHTML: '<button class="btn btn-success">Updated Button</button>',
    connections: [[5, 0]],
    descriptionText: 'Replace primary button with success styling'
  },
  {
    changeType: ChangeType.REPLACE,
    querySelector: '.header-title',
    replacementHTML: '<h1 class="new-title">Updated Header</h1>',
    connections: [[0, 1], [1, 2]],
    descriptionText: 'Replace main header with updated styling'
  },
  {
    changeType: ChangeType.INSERT,
    querySelector: '#content-area',
    replacementHTML: '<div class="alert alert-info">New notification banner</div>',
    connections: [[2, 3]],
    descriptionText: 'Insert notification banner at top of content area'
  },
  {
    changeType: ChangeType.MODIFY,
    querySelector: '.sidebar ul',
    replacementHTML: '<ul class="nav-list"><li><a href="/home">Home</a></li><li><a href="/about">About</a></li></ul>',
    connections: [[1, 3], [3, 4]],
    descriptionText: 'Update sidebar navigation with new menu items'
  },
  {
    changeType: ChangeType.DELETE,
    querySelector: '.deprecated-widget',
    replacementHTML: '',
    connections: [[0, 4]],
    descriptionText: 'Remove deprecated widget from layout'
  },
  {
    changeType: ChangeType.APPEND,
    querySelector: 'footer',
    replacementHTML: '<p class="copyright">&copy; 2025 Company Name. All rights reserved.</p>',
    connections: [[4, 5], [2, 5]],
    descriptionText: 'Add copyright notice to footer'
  },
  {
    changeType: ChangeType.REPLACE,
    querySelector: '.btn-primary',
    replacementHTML: '<button class="btn btn-success">Updated Button</button>',
    connections: [[5, 0]],
    descriptionText: 'Replace primary button with success styling'
  },
];

export default nodes;
