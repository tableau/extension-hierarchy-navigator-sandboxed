import * as React from 'react';
import * as ReactDOM from 'react-dom';
import image from '../images/TableauCheckbox.png';

class Home extends React.Component<any, any> {
    public render() {
        return (
			<React.Fragment>
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<div><img src={image} /></div>
							<h1 className='iheader'>Hierarchy Navigator Parameters v2.0</h1>
							<span className='tagline'>One checkbox. Two values.</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>This extension allows you to have a Hierarchy Navigator that can toggle between two values.  </p>
							<p>Why? Because users have been <a href='https://community.tableau.com/ideas/2834'>asking</a> for this for a long time.</p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
								<li>Create a parameter with a list of 2 values.</li>
								<li>Drag in a new Extension object to your dashboard.</li>
                                <li>Download/find the <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-2.0.trex'> manifest file</a>.</li>
								<li>Select the parameter you created above for the extension to manipulate.</li>
								<li>Select the options as presented.</li>
								<li>Click 'OK'.</li>
							</ol>
							<p><b>Note:</b> You can add as many instances of this extension as you like!</p>
							<div className='gh' style={{paddingTop: '10px'}}>
								Get this extension and more in the <a href='https://extensiongallery.tableau.com/'>Extension Gallery</a>.
								<br />
								<a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed'>View on GitHub</a>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
        );
    }
}

export default Home;
ReactDOM.render(<Home />, document.getElementById('container'));