import { Checkbox, Stepper, TextField, TextArea } from '@tableau/tableau-ui';
import React from 'react';
import { HierarchyProps, HierType } from '../API/Interfaces';

interface Props {
    data: HierarchyProps;
    setUpdates: (obj: { type: string, data: any; }) => void;
}

export function Page4(props: Props) {
    const setTitleInputProps={
        disabled: !props.data.options.titleEnabled,
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_TITLE', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_TITLE', data: 'Hierarchy Navigator' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.title
    };
    const setFontFamilyInputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_FAMILY', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_FONT_FAMILY', data: '"Benton Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;"' });
        },
        style: { width: 200, paddingLeft: '9px', fontFamily: props.data.options.fontFamily, marginTop: '3px' },
        value: props.data.options.fontFamily,
        rows: 3
    };
    const setFontSizeInputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_SIZE', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_FONT_SIZE', data: '12px' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.fontSize
    };
    const setBGColorInputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_BG_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_BG_COLOR', data: '#F3F3F3' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.bgColor
    };
    const setFontColorInputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_FONT_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_FONT_COLOR', data: 'rgba(0, 0, 0, 0.8)' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.fontColor
    };
    const setHighlightColorInputProps={
        errorMessage: undefined,
        kind: 'line' as 'line'|'outline'|'search',
        onChange: (e: any) => {
            props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: e.target.value });
        },
        onClear: () => {
            props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: 'rgba(0, 0, 0, 0.8);' });
        },
        style: { width: 200, paddingLeft: '9px' },
        value: props.data.options.highlightColor
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
    const fontColorChange=(color: any): void => {
        props.setUpdates({ type: 'SET_FONT_COLOR', data: color.target.value });
    };
    const highlightColorChange=(color: any): void => {
        props.setUpdates({ type: 'SET_HIGHLIGHT_COLOR', data: color.target.value });
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
                Note:  color picker pop-up may open behind this window.
                <br />
                <input type='color' value={props.data.options.bgColor} onChange={bgChange} style={{ backgroundColor: props.data.options.bgColor }} className='mb-2'/> <TextField {...setBGColorInputProps} />Background Color
                <p />
                <input type='color' value={props.data.options.highlightColor} onChange={highlightColorChange} style={{ backgroundColor: props.data.options.highlightColor }} className='mb-2'/> <TextField {...setHighlightColorInputProps} />Highlight Color 
                <p />
                <input type='color' value={props.data.options.fontColor} onChange={fontColorChange} style={{ backgroundColor: props.data.options.fontColor }} className='mb-2'/> <TextField {...setFontColorInputProps} />Font Color
                <p />
                <div style={{marginLeft:'18px'}}>
                <TextField {...setFontSizeInputProps}/>CSS Font Size
                <p />
                <TextArea {...setFontFamilyInputProps} />CSS Font Family
                <p />
                </div>
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
                <TextField {...setTitleInputProps} />
                <p />
                <Checkbox
                    checked={props.data.options.dashboardListenersEnabled}
                    onChange={toggleDashboardListenersEnabled}
                >
                    Parameters should listen for dashboard changes.  Only needed if the Extension should listen to changes coming from the dashboard for {props.data.type===HierType.RECURSIVE? 'Child ID and Child Label':'Child Label'}.  EG - will the dashboard drive the selection of the hierarchy.
                </Checkbox>
                <div style={{marginLeft:'18px', display:props.data.options.dashboardListenersEnabled?'':'none'}}>
                    <Stepper min={100} max={10000} step={50} pageSteps={5} value={props.data.options.debounce} floatingPoint={false} onValueChange={changeDebounce} disabled={!props.data.options.dashboardListenersEnabled} className='mb-2'/> If the dashboard updates slowly when changing values and the Extension is listening to dashboard changes you may experience a circular loop where the Extension and dashboard are both trying to control the data.  In this case, increase the debounce time (in ms).
                </div>

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