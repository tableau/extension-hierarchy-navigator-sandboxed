import * as React from 'react';
import * as ReactDOM from 'react-dom';
import image from '../images/TableauHierarchyNavigator.png';

class Home extends React.Component<any, any> {
    public render() {
        return (
			<React.Fragment>
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<div><img src={image} width='45%'/></div>
							<h1 className='iheader'>Hierarchy Navigator Extension</h1>
							<span className='tagline'>Recursive Data Visualized</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>This extension allows you to take flat/dimensional or recursive data and visualize it and enable interactions with other dashboard components.  </p>
							<p>Why? Because users have been <a href='https://community.tableau.com/ideas/1083'>asking</a> for this for a long time.</p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
                                <li>Download/find the <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/hierarchynavigator-1.0.trex'> manifest file</a>.</li>
								<li>View the <a href='https://github.com/tableau/extension-hierarchy-navigator-sandboxed'>README</a> in the GitHub repository and/or <a href='https://tableau.github.io/extension-hierarchy-navigator-sandboxed/Hierarchy%20Navigator%20Extension.twbx'>download</a> the sample workbook with directions and examples.</li>
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
ReactDOM.render(<Home />, document.getElementById('app'));