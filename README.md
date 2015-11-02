# Monoset - Free Drupal 8 theme

Uses Node.js, Gulp, BrowserSync for Sass compiling, task running and Browser Syncing.

**Demo**: [http://subtleshift.net](http://subtleshift.net)

## Requirements
- Node.js - Install node.js. If you have “homebrew” - $ brew install node
- LibSass - Install libsass - $ npm install node-sass
- Gulp.js - Install gulp globally - $ npm install gulp -g
- BrowserSync - Install BrowserSync - $ npm install -g browser-sync

## Installation
- Install Gulp ($ npm install gulp -g)
- CD into the theme directory and run $ npm install to fetch all dependencies.
- For BrowserSync update proxy server in gulpfile.js to match your local environment.
- CD into the theme directory and run “gulp” to start  gulp watching, compiling and Browser Syncing.

## Styleguide
- Living styleguide is automaticaly generatted and can be viewed on port: 3005 (http://localhost:3005). Port can be changed in the gulp.js
- Styleguide files are generated on running default "gulp" command inside the theme's "styleguide" directory.