# Hierarchy Navigator
This extension allows you to visualize your recursive data (or 2 columns of non-recursive data) in a Tableau Dashboard. 

## What does it do?
* Creates a tree menu for selection
* Enables search across the tree
* Allows up to 2 parameters for bi-directional sync (for both the current node label and id)
* Enables filtering of the original sheet without impacting the extension
* Enables mark selection on the original sheet
* With combinations of any of the above, you dashboard expansion possibilities are limitless!

## How to use an Extension
Follow the below steps to configure the extension.  This extension is hosted on <a href="https://tableau.github.io/extension-hierarchy-navigator-sandboxed">Github.io Pages</a>

## tl;dr. Download the [manifest file](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.trex) and [workbook with examples and directions](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Hierarchy%20Navigator%20Extension.twbx)

![Animated Image](/src/images/AnimatedSample.gif)

### Setting up the worksheet source
Load a source sheet with your recursive data. 
* The ideal data will have a parent/child relationship.  This Extension will also work with 2 columns of data that are non-recursive.
* A third dimension, for the label of the child node, can optionally be added if your parent/child dimensions are id or key fields.  
* The label for the child node can be the same as the child id or key field.  The label field should be set to the same as the child id if you data is not-recursive.
* Only the child label will be displayed in the resulting visualization.  A parent label isn't needed or used.  
* This sheet can be hidden from the dashboard and the minimal amount of visualization (eg bar charts will load faster than a long table).

### Setting up optional parameters
This extension can use up to two parameters of data type `String` and Allowable values `All`.
* The first optional parameter will hold the value of the currently selected label.
* The other optional parameter will hold the value of the currently selected id/key.
* Both parameters are bi-directional.  If you choose a value in the hierarchy it will populate the parameters.  If you type in a value (or have the parameter populated via another sheet) it will load the correct member in the hierarchy.
* If an invalid (not present in the hierarchy) value is typed in either parameter it will be ignored.

### Setting up an optional filter
This parameter can populate a filter for the current node and its children nodes.
* The available filters will be shown if they are created on the child id or child label field.
* Filtering out the data will not affect the Extension because the Extension caches the data.  
* The Extension will set the filter to "all" values before it loads.


### Adding an optional "Enable mark selection" feature
This extension can emulate selecting marks with a mouse.  It will select the current node and its children node.  This feature is useful for enabling Dashboard Actions that can add further capabilities and interactions in your dashboard. 

### Adding the extension to the dashboard
* Add the worksheet with the hierarchy data to the dashboard.
* Download the Hierarchy Navigator [manifest file](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.trex). 
* Open Tableau Desktop 2018.2 or higher (2018.4 or newer for sandboxed extensions).
* Drag in the "Extension" object to a dashboard. 
* Click "My Extensions" and find the manifest file (.trex) you downloaded above.
* Configure the extension (see next section).

### Configure the extension
The configuration has three parts: Sheets and Fields, Parameters, and Display
* Sheets and Fields
  * Select the worksheet with the hierarchy data
  * Select the field that represents the Parent ID (or key or label)
  * Select the field that represents the Child ID (or key or label)
  * Select the field that represents the Child Label (can be the same as the Child ID)
* Interactions
  * Enable/disable any parameters you created above
  * Enable/disable the filter if you created one
  * Enable/disable mark selection
* Display
  * Select the background color for the extension object

## Known Bugs/Limitations
* There is a known issues in Tableau 2018.2 running on Mac computers where the native dropdown (when selecting the parameter) cannot be chosen with the mouse.  Please use the keyboard to select the parameter.
* If you add a blank sheet to the dashboard and try to configure the extension you will receive an error.
* If you type in invalid values into the parameters they will just be ignored.
* The only color that can be changed is the background color.


## Dev build notes
For anyone that wants to build/modify/re-use this code here are some useful notes.
* ParelJS is used to build/transpile the source code.  Source code is transpiled from /src to /docs.
* tabextsandbox is used to host the sandboxed source files.  Source code is hosted from /docs.
* In development it is useful to automate the development tasks, the best way to do this with this Extension is to run `npm run watch-compile` to start ParcelJS.  Next (in a separate window) run `npm run start-sandbox` to start the sandbox process.  Both of these processes should continue to run and when any files are saved they will automatically be re-compiled from /src to /docs and then will be served.
* Both of these NPM scripts use nodemon which will restart the processes when it sees changes on the file system.  While Parcel has a watch mode, it wasn't found to be reliable when saving files in sub-directories.