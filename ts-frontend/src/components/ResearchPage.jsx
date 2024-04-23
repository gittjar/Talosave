import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlUpload from '../forms/UrlUpload';
import config from '../configuration/config';

const ResearchPage = ({ propertyId }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${config.baseURL}/api/files`, {
          params: {
            propertyId: propertyId,
          },
        });
        setFiles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFiles();
  }, [propertyId]);

  return (
    <div>
      <h1>Research Page</h1>
      <p>This is a basic React page.</p>
      <UrlUpload propertyId={propertyId} />
      <h2>Ladatut tiedostot</h2>
      <ul>
      {files.map(file => (
    <li key={file._id}>
        <a href={file.url} target="_blank" rel="noopener noreferrer">
            {file.name}
        </a>
    </li>
))}
      </ul>
    </div>
  );
};

export default ResearchPage;