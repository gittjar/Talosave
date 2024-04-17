import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from '../forms/FileUpload';
import config from '../configuration/config';

const ResearchPage = ({ propertyId }) => { // receive propertyId as a prop
  const [files, setFiles] = useState([]);
  

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${config.baseURL}/api/files`, {
          params: {
            propertyId: propertyId, // include the property ID as a query parameter
          },
        });
        setFiles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFiles();
  }, [propertyId]); // add propertyId as a dependency

  return (
    <div>
      <h1>Research Page</h1>
      <p>This is a basic React page.</p>
      <FileUpload propertyId={propertyId} /> {/* pass propertyId to FileUpload */}
      <h2>Uploaded Files</h2>
      <ul>
      {files.map(file => (
          <li key={file._id}>
          <a href={`/download/${file.name}`} target="_blank" rel="noopener noreferrer">
            property ID: {propertyId} - {file.name} ({file.size} bytes)
          </a>
        </li>
      ))}
    </ul>
    </div>
  );
};

export default ResearchPage;