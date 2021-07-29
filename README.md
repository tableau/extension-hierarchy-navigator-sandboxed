# Hierarchy Navigator
This extension allows you to visualize your flat/dimensional or recursive data in a Tree/Hierarchy Extension an a Tableau Dashboard. 

## What does it do?
* Creates a tree menu for selection
* Enables search across the tree
* Allows for bi-directional parameter sync
* Enables filtering of the original sheet without impacting the extension
* Enables mark selection on the original sheet
* With combinations of any of the above, you dashboard expansion possibilities are limitless!

## How to use an Extension
This extension is hosted on <a href="https://tableau.github.io/extension-hierarchy-navigator-sandboxed">Github.io Pages</a>

## Download the [sandboxed manifest file](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.sandboxed.trex) and [workbook v2 with examples and directions (2018.3+ with Set Actions)](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Hierarchy%20Navigator%20Extension%20v2.twbx) and a [2018.2 workbook with a flat/dimensional hierarchy](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Dimensional-Flat%20example%20Hierarchy%20Navigator_v2018.2.twbx) that also shows "dynamic" drill-down.

![Animated Image](/src/images/AnimatedSample.gif)



## Known Bugs/Limitations
* There is a known issues in Tableau 2018.2 running on Mac computers where the native dropdown cannot be chosen with the mouse.  Please use the keyboard to select the parameter.

## Dev build notes
For anyone that wants to build/modify/re-use this code here are some useful notes.
* ParcelJS is used to build/transpile the source code.  Source code is transpiled from /src to /docs.
* tabextsandbox is used to host the sandboxed source files.  Source code is hosted from /docs.
* In development it is useful to automate the development tasks, the best way to do this with this Extension is to run `npm run watch-compile` to start ParcelJS.  Next (in a separate window) run `npm run start-sandbox` to start the sandbox process.  Both of these processes should continue to run and when any files are saved they will automatically be re-compiled from /src to /docs and then will be served.
* Both of these NPM scripts use nodemon which will restart the processes when it sees changes on the file system.  While Parcel has a watch mode, it wasn't found to be reliable when saving files in sub-directories.