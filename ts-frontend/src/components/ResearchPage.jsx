import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from '../forms/FileUpload';
import config from '../configuration/config';

const ResearchPage = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${config.baseURL}/api/files`); // Get files from the Mongo backend
        setFiles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Research Page</h1>
      <p>This is a basic React page.</p>
      <FileUpload />
      <h2>Uploaded Files</h2>
      <ul>
        {files.map(file => (
          <li key={file._id}>{file.name} ({file.size} bytes)</li>
        ))}
      </ul>
    </div>
  );
};

export default ResearchPage;