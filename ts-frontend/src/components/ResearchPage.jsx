import React from 'react';
import FileUpload from '../forms/FileUpload';

class ResearchPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Research Page</h1>
        <p>This is a basic React page.</p>
        <FileUpload />
      </div>
    );
  }
}

export default ResearchPage;