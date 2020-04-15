import * as t from '@tableau/extensions-api-types';
import { Spinner } from '@tableau/tableau-ui';
import 'babel-polyfill';
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import '../../css/style.css';
import { debug, defaultSelectedProps, HierarchyProps } from '../config/Interfaces';
import ParamHandler from './ParamHandler';

function HierarchyNavigator() {
    const [dashboard, setDashboard]=useState({});
    const [doneLoading, setDoneLoading]=useState(false);
    const [data, setData]=useState<HierarchyProps>(defaultSelectedProps);
    
    // Pops open the configure page if extension isn't configured
    const configure=(): any => {
        if(debug) { console.log(`calling CONFIGURE`); }

        const popupUrl=`config.html`;
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, '', { height: 725, width: 500 }).then((closePayload: string) => {

            if(debug) { console.log(`returning from Configure! ${ closePayload }`); }
            if(closePayload==='true') {
                const settings=tableau.extensions.settings.getAll();
                console.log(`what is settings?`);
                try {
                    let settingsData={};
                    if(settings.data) {
                        settingsData=JSON.parse(settings.data);
                        if(debug) {
                            console.log(`loaded settingsData:`);
                            console.log(settingsData);
                        }
                        setData(JSON.parse(settings.data));
                    }
                }
                catch(e) {
                    console.error(`Error loading getAll ${ e }`);
                }
                setDoneLoading(true);
            }
        }).catch((error: any) => {
            switch(error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    if(debug) { console.log('Dialog was closed by user.'); }
                    break;
                default:
                    console.error(error.message);

            }
        });
    };

    useEffect(() => {
        tableau.extensions.initializeAsync({ configure }).then(() => {
            setDashboard(tableau.extensions.dashboardContent!.dashboard);
            const settings=tableau.extensions.settings.getAll();
            if(typeof settings.data==='undefined') { configure(); }
            else {

                try {
                    let settingsData={};
                    if(settings.data) {
                        settingsData=JSON.parse(settings.data);
                        if(debug) {
                            console.log(`loaded settingsData:`);
                            console.log(settingsData);
                        }
                        setData(JSON.parse(settings.data));
                    }
                }
                catch(e) {
                    console.error(`Error loading getAll ${ e }`);
                }
            }
            setDoneLoading(true);
        });
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor=data.bgColor;
    }, [data.bgColor]);

    return (
        <>
            {!doneLoading? (<div aria-busy='true' className='overlay'><div className='centerOnPage'><div className='spinnerBg centerOnPage'>{}</div><Spinner color='light' /></div></div>):undefined}
            <div style={{ overflowX: 'hidden' }}>
                <p />
                    <ParamHandler
                        data={data}
                        dashboard={dashboard as t.Dashboard}

                    />
            </div>
        </>
    );
}

ReactDOM.render(<HierarchyNavigator />, document.getElementById('app'));