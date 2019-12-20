# Hierarchy Navigator
This extension allows you to visualize your recursive data in a Tableau Dashboard.  Two way interactivity with other dashboard components can be realized via two parameters.  

## How to use an Extension
Follow the below steps to configure the extension.

## Using the Hierarchy Navigator Extension - <a href="https://tableau.github.io/extension-hierarchy-navigator-sandboxed">Github.io Homepage</a>

### Setting up the worksheet source
Load a source sheet with your recursive data. 
*  The data must have a parent/child relationship.
*  A third dimension, for the label of the child node, can optionally be added if your parent/child dimensions are id or key fields.  
* The label for the child node can be the same as the child id or key field.
* Only the child label will be displayed in the resulting visualization.  A parent label isn't needed or used.  
* This sheet can be hidden from the dashboard and the minimal amount of visualization (eg bar charts will load faster than a long table).

### Setting up parameters
This extension requires two parameters of data type `String` and Allowable values `All`.
* The first parameter will hold the value of the currently selected label.
* The other parameter will hold the value of the currently selected id/key.
* If you only have two dimension fields in the data you will still need to setup and configure two parameters.  In this scenario, you can ignore the parameter that you will not use.
* Both parameters are bi-directional.  If you choose a value in the hierarchy it will populate the parameters.  If you type in a value (or have the parameter populated via another sheet) it will load the correct member in the hierarchy.
* If an invalid (not present in the hierarchy) value is typed in either parameter it will be ignored.

### Adding the extension to the dashboard
* Add the worksheet with the hierarchy data to the dashboard.
* Download the Hierarchy Navigator [manifest file](https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-2.0.trex). 
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
* Parameters
  * Select the two parameters you created above
* Display
  * Select the background color for the extension object

## Known Bugs/Limitations
* There is a known issues in Tableau 2018.2 running on Mac computers where the native dropdown (when selecting the parameter) cannot be chosen with the mouse.  Please use the keyboard to select the parameter.
* If you add a blank sheet to the dashboard and try to configure the extension you will receive an error.
* If you type in invalid values into the parameters they will just be ignored.
* Access to underlying data is limited to 10,000 rows.
* The only color that can be changed is the background color.


## Dev build notes
For anyone that wants to build/modify/re-use this code here are some useful notes.
* ParelJS is used to build/transpile the source code.  Source code is transpiled from /src to /docs.
* tabextsandbox is used to host the sandboxed source files.  Source code is hosted from /docs.
* In development it is useful to automate the development tasks, the best way to do this with this Extension is to run `npm run watch-compile` to start ParcelJS.  Next (in a separate window) run `npm run start-sandbox` to start the sandbox process.  Both of these processes should continue to run and when any files are saved they will automatically be re-compiled from /src to /docs and then will be served.
* Both of these NPM scripts use nodemon which will restart the processes when it sees changes on the file system.  While Parcel has a watch mode, it wasn't found to be reliable when saving files in sub-directories.