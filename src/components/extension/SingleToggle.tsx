import * as React from 'react';
import Switch from 'react-switch';

export interface Props {
  bg: any;
  checked: boolean;
  label: string;
  onChange: (checked: boolean, e: any, id: any) => void;
  parameter: string;
  show_name: boolean;
  txt: any;
  uiDisabled: boolean;
}

// Shows if setting has not yet been configured
export const SingleToggle: React.SFC<Props> = props => {
  const height = 18;
  return (
    <div className='d-flex flex-fill flex-wrap'>
      <div className='pr-2' style={{ fontWeight: 'bold', color: props.txt }}>
        {props.show_name ? props.parameter : ''}
      </div>
      <div style={{ marginBottom: '0' }}>
        <label>
          <Switch
            onChange={props.onChange}
            checked={props.checked}
            disabled={props.uiDisabled}
            height={height}
            width={height * 2}
            className='react-switch'
          />
          <span style={{ color: props.txt, marginLeft: '4px' }}>
            {props.label}
          </span>
        </label>
      </div>
    </div>
  );
};

SingleToggle.displayName = 'SingleToggle';
