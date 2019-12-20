import { Checkbox } from '@tableau/tableau-ui';
import * as React from 'react';

/* tslint:disable:no-console */

export interface SelectorProps {
    allowableValues: any;
    enabled: boolean;

    which_label: number;
}

interface State {
    checked: boolean
}

// Shows if setting has not yet been configured
class PreviewCheckbox extends React.Component<any, State> {
    public state: State = {
        checked: false
    }

    public constructor(props: any) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    public onChange() {
        this.setState((prevState) => ({ checked: !prevState.checked }))
    }

    public render() {
        const { allowableValues, bg, which_label, enabled, txt, show_name, parameter } = this.props;
        let label = ''
        if (enabled) {
            label = allowableValues.allowableValues[which_label].formattedValue
        }

        return (
            <div style={{ display: enabled ? '' : 'none' }} className='pt-2'>
                <div style={{paddingLeft: '10px' }}>
                    Preview the checkbox
                </div>
                <div className='col-sm p-3 d-flex flex-wrap' style={{ backgroundColor: bg, borderStyle: 'solid', borderColor: 'lightgray' }}>
                    <div className='pr-2' style={{ marginBottom: '.5rem', fontWeight: 'bold', color: txt }}>
                        {show_name ? parameter : ''}
                    </div>
                    <div>
                        <Checkbox checked={this.state.checked} onChange={this.onChange} ><span style={{ color: txt }}>{label}</span></Checkbox>
                    </div>
                </div>
            </div>
        );
    };
}


export default PreviewCheckbox;