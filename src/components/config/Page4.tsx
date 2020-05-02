import { Checkbox, Stepper, TextField } from '@tableau/tableau-ui';
import React from 'react';
import { HierarchyProps, HierType } from '../API/Interfaces';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
}

export function Page4(props: Props) {
    const inputProps={
        disabled: !props.data.options.titleEnabled,
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        // label: `Title for Extension`,
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_TITLE', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_TITLE', data: 'Hierarchy Navigator' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.title
    };
    const changeTitleEnabled=(e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_TITLE_DISABLED', data: e.target.checked });
    };
    const changeSearch=(e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_SEARCH_DISPLAY', data: e.target.checked });
    };
    // Handles change in background color input
    const bgChange=(color: any): void => {
        props.setUpdates({ type: 'SET_BG_COLOR', data: color.target.value });

    };
    const changeDebounce=(value: number): void => {
        props.setUpdates({ type: 'SET_DEBOUNCE', data: value });

    };
    const toggleDebug=(e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_DEBUG', data: e.target.checked });
    };
    const toggleDashboardListenersEnabled=(e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setUpdates({ type: 'TOGGLE_DASHBOARD_LISTENERS', data: e.target.checked });
    };


    // Options CONTENT
    return (
        <div className='sectionStyle mb-2'>
            <b>Options</b>
            <br />
            <div style={{ marginLeft: '9px' }}>
                <input type='color' value={props.data.options.bgColor} onChange={bgChange} style={{ backgroundColor: props.data.options.bgColor }} className='mb-2'/> Background Color (color picker pop-up may open behind this window)

                <p />
                <Checkbox
                    checked={props.data.options.searchEnabled}
                    onChange={changeSearch}
                >
                    Show Search Box
                </Checkbox>
                <p />
                <Checkbox
                    checked={props.data.options.titleEnabled}
                    onChange={changeTitleEnabled}
                >
                    Show Title
                </Checkbox>
                <TextField {...inputProps} />
                <p />
                <Checkbox
                    checked={props.data.options.dashboardListenersEnabled}
                    onChange={toggleDashboardListenersEnabled}
                >
                    Paramaters should listen for dashboard changes.  Only needed if the Extension should listen to changes coming from the dashboard for {props.data.type===HierType.RECURSIVE? 'Child ID and Child Label':'Child Label'}.  EG - will the dashboard drive the selection of the hierarchy.
                </Checkbox>
                <p />
                <Stepper min={100} max={10000} step={50} pageSteps={5} value={props.data.options.debounce} floatingPoint={false} onValueChange={changeDebounce} disabled={!props.data.options.dashboardListenersEnabled} label='If the dashboard updates slowly when changing values and the Extension is listening to dashboard changes you may experience a circular loop where the Extension and dashboard are both trying to control the data.  In this case, increase the debounce time.' className='mb-2'/>

                <p />
                <Checkbox
                    checked={props.data.options.debug}
                    onChange={toggleDebug}
                >
                    Enable Debug
                </Checkbox>
                <br />
            </div>
        </div>
    );
}