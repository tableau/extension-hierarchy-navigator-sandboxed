# Hierarchy Navigator
This extension allows you to visualize your flat/dimensional or recursive data in a Tree/Hierarchy Extension an a Tableau Dashboard. 

## What does it do?
* Creates a tree menu for selection from either flat or hierarchical data
* Enables searching the tree
* Allows for bi-directional parameter sync
* Enables filtering of the original sheet without impacting the extension
* Enables mark selection on the original sheet
* With combinations of any of the above, you dashboard expansion possibilities are limitless!

![Animated Image](/src/images/AnimatedSample.gif)

## How to use an Extension
This extension is available as a sandboxed extension: [sandboxed manifest file](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.sandboxed.trex).  

The landing page is hosted on <a href="https://tableau.github.io/extension-hierarchy-navigator-sandboxed">Github.io Pages</a>

## Instructions for use

1. Download the [sample workbook with examples and directions (2018.3+ with Set Actions)](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Hierarchy%20Navigator%20Extension%20v2.twbx).
2. Directions for setup are in the workbook on pages 10 and 11 of the story.

### Customization

1. General Tab
   * Show Search Box - show or disable the search box
   * Show Title - Show or hide the title inside the extension
   * Parameters should listen for dashboard changes - Check this box if you want other sheets to drive the selection of the hierarchy
   * Enable debug - show debug information in the extension and add console.log statements to the Developer Console (in [debug](https://tableau.github.io/extensions-api/docs/trex_debugging.html) mode)
2. Colors/Fonts
   * Background Color* - Change the background color for the extension.  
   * Font Color* - Change the color of the text
   * Highhlight Color* - Change the color of the currently selected element
      \* Accepts any valid CSS color (#ffffff, rgb(x,y,z), or string literal like 'green')
   * Font Size - Accepts any valid CSS font size (12px, 2rem, etc)
   * Font Family - Valid [fonts that are installed on your Tableau server](https://help.tableau.com/current/server/en-us/customize_fonts.htm)
   * CSS for Items - Any valid React css (see [Styling React Using CSS](https://www.w3schools.com/react/react_css.asp)).  This will be applied to each entry in the tree and may override other properties on this page.  Property names are in camelCase, eg, `min-width` in a traditional file would be written as `minWidth` in React CSS.
3. Icons
   * Both the open icon and closed icon can be any of:
      * Default - left facing and down angle brackets. (will respect the font color property)
      * Base64 Image - Convert an image with a [Base64 image converter](https://www.base64-image.de/) and past the resulting string in the box.  Valid strings start with `data:image/xyz;base64,...`.  Images should be 12px tall if you are using the 12px font size.
      * Ascii - any valid single/multiple ascii characters (will respect the font color property)



## Known Bugs/Limitations
* There is a known issues in Tableau 2018.2 running on Mac computers where the native dropdown cannot be chosen with the mouse.  Please use the keyboard to select the parameter.

## Dev build notes
For anyone that wants to build/modify/re-use this code here are some useful notes.
* Build Scripts
   1.  `npm start` - Run the local development environment (not sandboxed) with hot reload.  Use the `hierarchynavigator-1.0.local.trex` manifest.
   1.  `npm run build` - Compile build files in the docs directory.
   1.  `npm run sandbox` - Run the build files in the tabextsandbox environment. Use the `hierarchynavigator-1.0.local.sandboxed.trex` manifest.
