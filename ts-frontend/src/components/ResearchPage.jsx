import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlUpload from '../forms/UrlUpload';
import config from '../configuration/config';

  const ResearchPage = ({ propertyId }) => {
    const [files, setFiles] = useState([]);
  
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
  
    useEffect(() => {
      fetchFiles();
    }, [propertyId]);
  
    return (
      <div className='mx-5'>
        <h3 className='mb-3'>Tutkimukset ja linkit</h3>
        <UrlUpload propertyId={propertyId} onUpload={fetchFiles} />
        <hr></hr>
        <h4>Ladatut tiedostot</h4>
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