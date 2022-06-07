import '../../resources/tableau.extensions.1.latest.js';
import * as t from '@tableau/extensions-api-types';
import { Spinner } from '@tableau/tableau-ui';
import  React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/style.css';
import { debugOverride, defaultSelectedProps, HierarchyProps } from '../API/Interfaces';
import ParamHandler from './ParamHandler';
var extend = require('extend');

function HierarchyNavigator() {
    const [dashboard, setDashboard] = useState({});
    const [doneLoading, setDoneLoading] = useState(false);
    const [data, setData] = useState<HierarchyProps>(defaultSelectedProps);

    // Pops open the configure page if extension isn't configured
    const configure = (): any => {
        if (debugOverride) { console.log(`calling CONFIGURE`); }

        let popupUrl = `config.html`;
        console.log(`version: ${tableau.extensions.environment.tableauVersion}`);
        console.log(`hostname: ${window.location.hostname}`);
        console.log(window.location)
        const version = tableau.extensions.environment.tableauVersion.split('.');
        // if version < 2019.3 need an absolute URL
        if (parseInt(version[0], 10) === 2018 || (parseInt(version[0], 10) === 2019 && parseInt(version[1], 10) < 3)) {
            const href = window.location.href;
            popupUrl = window.location.href.substring(0, href.lastIndexOf('/')) + '/config.html';
        }
        tableau.extensions.ui.displayDialogAsync(popupUrl, '', { height: 650, width: 500 }).then((closePayload: string) => {

            if (debugOverride) { console.log(`returning from Configure! ${closePayload}`); }
            if (closePayload === 'true') {
                const settings = tableau.extensions.settings.getAll();
                console.log(`what is settings?`);
                try {
                    let settingsData = {};
                    if (settings.data) {
                        settingsData = JSON.parse(settings.data);
                        // for compatibility from published 1.0 version to 1.1 
                        if (debugOverride) {
                            console.log(`loaded settingsData:`);
                            console.log(settingsData);
                        }
                        settingsData = extend(true, {}, defaultSelectedProps, settingsData);
                        setData(settingsData as HierarchyProps);
                    }
                }
                catch (e) {
                    console.error(`Error loading getAll ${e}`);
                }
                setDoneLoading(true);
            }
        }).catch((error: any) => {
            switch (error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    if (debugOverride) { console.log('Dialog was closed by user.'); }
                    break;
                default:
                    console.error(error.message);

            }
        });
    };

    React.useEffect(() => {
        tableau.extensions.initializeAsync({ configure }).then(() => {
            setDashboard(tableau.extensions.dashboardContent!.dashboard);
            const settings = tableau.extensions.settings.getAll();
            if (typeof settings.data === 'undefined') { configure(); }
            else {

                try {
                    let settingsData = {};
                    if (settings.data) {
                        settingsData = JSON.parse(settings.data);
                        settingsData = extend(true, {}, defaultSelectedProps, settingsData);
                        if (debugOverride) {
                            console.log(`loaded settingsData:`);
                            console.log(settingsData);
                        }
                        setData(settingsData as HierarchyProps);
                    }
                }
                catch (e) {
                    console.error(`Error loading getAll ${e}`);
                }
            }
            setDoneLoading(true);
            document.body.style.backgroundColor = data.options.highlightColor || defaultSelectedProps.options.highlightColor;
            document.body.style.backgroundColor = data.options.bgColor || defaultSelectedProps.options.bgColor;
        });
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor = data.options.highlightColor || defaultSelectedProps.options.highlightColor;
    }, [data.options.highlightColor]);
    useEffect(() => {
        document.body.style.backgroundColor = data.options.bgColor || defaultSelectedProps.options.bgColor;
    }, [data.options.bgColor]);
    useEffect(() => {
        document.body.style.fontSize = data.options.fontSize || defaultSelectedProps.options.fontSize;
    }, [data.options.fontSize]);
    useEffect(() => {

        let f = data.options.fontFamily || defaultSelectedProps.options.fontFamily;
        const semi = /;/g;
        const imp = /!important/g
        let important = false;
        if (f.search(imp) >= 0) {
            f = f.replace(semi, '');
            f = f.replace(imp, '');
            important = true;
        }
        document.body.style.setProperty('font-family', f, important ? 'important' : '')

    }, [data.options.fontFamily]);
    useEffect(() => {
        const semi = /;/g;
        const imp = /!important/g
        let important = false;
        let c = data.options.fontColor || defaultSelectedProps.options.fontColor;
        if (c.search(imp) >= 0) {
            c = c.replace(semi, '');
            c = c.replace(imp, '');
            important = true;
        }
        document.body.style.setProperty('color', c, important ? 'important' : '')
    }, [data.options.fontColor]);
    return (
        <>
            {!doneLoading ? (<div aria-busy='true' className='overlay'><div className='centerOnPage'><div className='spinnerBg centerOnPage'>{ }</div><Spinner color='light' /></div></div>) : undefined}
            <div>
                <p />
                <ParamHandler
                    data={data}
                    dashboard={dashboard as t.Dashboard}

                />
            </div>
        </>
    );
}

const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container);
root.render(<HierarchyNavigator />);