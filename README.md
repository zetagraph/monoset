# Monoset - Free Drupal 8 theme

Uses Node.js, Gulp, BrowserSync for Sass compiling, task running and Browser Syncing.

![Screenshot](https://www.drupal.org/files/project-images/monoset-screen-shot.jpg)

**Demo**: http://subtleshift.me

## Requirements
- Node.js
- Gulp.js - Install gulp globally with $ npm install gulp -g

## Installation
- Install Gulp ($ npm install gulp -g)
- CD into the theme directory and run $ npm install to fetch all dependencies.
- For BrowserSync update proxy server in gulpfile.js to match your local environment.
- CD into the theme directory and run “gulp” to start  gulp watching, compiling and Browser Syncing.

## Styleguide (Optional / Experimental)
- Living styleguide is automaticaly generatted and can be viewed on port: 3010 (http://localhost:3010). Port can be changed in the gulp.js
- Styleguide files are generated on running default "gulp" command inside the theme's "styleguide" directory.

## Additional Info
- You can also check out a Drupal North presentation where I go over some of the stuff here: [https://youtu.be/do5cUO9BDwk](https://youtu.be/do5cUO9BDwk) Slides: [https://goo.gl/Jx22dB](https://goo.gl/Jx22dB) 
