import { Extensions } from '@tableau/extensions-api-types/ExternalContract/Namespaces/Extensions';
import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../css/style.css';
import { debug, defaultSelectedProps, SelectedProps } from '../config/Interfaces';
import ParamHandler from './ParamHandler';


declare global {
    interface Window { tableau: { extensions: Extensions; }; }
}
interface Settings {
    bgColor: string,
    txtColor: string,
    configComplete: boolean,
    selectedProps: SelectedProps,
}
interface Tree {
    key: string,
    label: string,
    parent: string,
    path?: string,
    nodes: Tree[];
}
interface State {
    activeKey: string;
    extensionSettings: Settings;
    // currentId: string;
    // currentLabel: string;
    uiDisabled: boolean;
    openNodes: string[];
    data: Tree[];
    worksheet: any;
    lastUpdated: Date;
}


class HierarchyNavigator extends React.Component<any, State> {

    public dashboard: any; // object to hold the Tableau Dashboard
    public genericError='This Extension could not retrieve the parameter.  Please add a parameter or select a new one.'; // if param gets deleted or other error
    private configureStr='Please configure this extension to display the formatted parameter.'; // Message to display in the main window for error/not configured
    // public hierarchy: Hierarchy;
    // public paramHandler: EventHandler;
    // public childRef: any;
    private configEventHandler: any;
    public constructor(props: any) {
        super(props);
        // this.loadHierarchy=this.loadHierarchy.bind(this);
        this.resetParams=this.resetParams.bind(this);
        this.configure=this.configure.bind(this);
        this.state={
            activeKey: '',
            data: [],
            extensionSettings: {
                bgColor: '#F3F3F3',
                configComplete: false,
                selectedProps: defaultSelectedProps,
                txtColor: '#000000',
            },
            lastUpdated: new Date(),
            openNodes: [],
            uiDisabled: false,
            worksheet: '',

        };
        // this.childRef=React.createRef();
        window.tableau.extensions.initializeAsync({ configure: this.configure }).then(() => {
            this.dashboard=window.tableau.extensions.dashboardContent!.dashboard;
            // this.hierarchy=new Hierarchy(this);
            // this.paramHandler=new EventHandler(this);
            this.updateExtensionBasedOnSettings();
            this.configEventHandler=window.tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent: any) => {
                this.updateExtensionBasedOnSettings(settingsEvent.newSettings);
            });
        })
            .catch((err: any) => {
                if(debug) { console.log(`Something went wrong.  Here is the error: ${ err }.<p> ${ err.stack }`); }
                this.resetParams();
            });

    }
    public componentDidMount() {
        if(debug) { console.log(`component MOUNTED`); }
    }
    public componentWillUnmount() {
        if(debug) { console.log(`component UNMOUNTED`); }
        // this.paramHandler.clearEventHandlers();
        if(this.configEventHandler) {
            this.configEventHandler();
            this.configEventHandler=undefined;
        }
    }
    public async updateExtensionBasedOnSettings(settings?: any) {
        if(typeof settings==='undefined') {
            settings=window.tableau.extensions.settings.getAll();
        }


        const configCompleteTmp=settings.configComplete==='true'? true:false;
        const selectedPropsTmp=typeof settings.selectedProps==='undefined'?
            defaultSelectedProps:JSON.parse(settings.selectedProps);
        settings=Object.assign({}, settings, { selectedProps: selectedPropsTmp }, { configComplete: configCompleteTmp });
        // this.paramHandler.clearEventHandlers();
        this.setState({ extensionSettings: { ...settings } });
        if(debug) {
            console.log(`loaded extension settings:`);
            console.log(settings);
        }
        if(settings.configComplete) {
            // await this.paramHandler.clearFilterAndMarksAsync();
            // this.hierarchy.clearHierarchy();
            document.body.style.backgroundColor=settings.bgColor;
            // this.loadHierarchy();
            this.setState({ lastUpdated: new Date() });
        }
        else {
            this.configure();
        }
    }

    // Pops open the configure page if extension isn't configured
    public configure=(): any => {
        if(debug) { console.log(`calling CONFIGURE`); }
        // this.paramHandler.clearFilterAndMarksAsync();
        // this.paramHandler.clearEventHandlers();
        if(debug) { console.log(`settings in configure:`); }
        if(debug) { console.log(this.state); }
        const popupUrl=`config.html`;
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, '', { height: 725, width: 500 }).then((closePayload: string) => {
            if(debug) { console.log(`returning from Configure! ${ closePayload }`); }
            if(debug) { console.log(`typeof return: ${ typeof closePayload }`); }
            if(closePayload==='true') {
                // this.loadHierarchy();
                // this.setState({lastUpdated: new Date()});
            }
        }).catch((error: any) => {
            switch(error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    if(debug) { console.log('Dialog was closed by user.'); }
                    break;
                default:
                    console.error(error.message);
                    this.resetParams(this.genericError);
            }
        });
    };

    public render() {
        return (
            <div style={{ overflowX: 'hidden' }}>

                <p>
                    <ParamHandler
                        // data={this.state.data}
                        // currentId={this.state.currentLabel}
                        // currentLabel={this.state.currentLabel}
                        dashboard={this.dashboard}

                        parameters={this.state.extensionSettings.selectedProps.parameters}
                        worksheet={this.state.extensionSettings.selectedProps.worksheet}
                        lastUpdated={this.state.lastUpdated}
                        configComplete={this.state.extensionSettings.configComplete}
                        type={this.state.extensionSettings.selectedProps.type}
                        separator={this.state.extensionSettings.selectedProps.seperator}
                    />
                    {/*  {JSON.stringify(this.state.extensionSettings, null, 2)} */}
                </p>
            </div>
        );
    }
    // reset all parameters
    public resetParams=(msg=this.configureStr) => {
        this.setState({
            extensionSettings: {
                bgColor: '#F3F3F3',
                configComplete: false,
                selectedProps: defaultSelectedProps,
                txtColor: '#000000'
            }
        });
    };
    // solve forEach with promise issue - https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    public asyncForEach=async (array: any[], callback: any) => {
        for(let index=0;index<array.length;index++) {
            await callback(array[index], index, array);
        }
    };


    // helper function
    public fakeWhiteOverlay(hex: string) {
        const rgb=this.hexToRgb(hex);
        if(rgb) {
            return `rgb(${ Math.min(Math.floor(rgb.r/2)+127, 255) }, ${ Math.min(Math.floor(rgb.g/2)+127, 255) }, ${ Math.min(Math.floor(rgb.b/2)+127, 255) })`;
        } else {
            return '#ffffff';
        }
    }

    // helper function
    public hexToRgb(hex: string) {
        const result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result? {
            b: parseInt(result[3], 16),
            g: parseInt(result[2], 16),
            r: parseInt(result[1], 16),
        }:null;
    }
}

ReactDOM.render(<HierarchyNavigator />, document.getElementById('app'));