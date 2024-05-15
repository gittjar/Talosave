import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlUpload from '../forms/UrlUpload';
import config from '../configuration/config';
import { toast } from 'react-toastify';
import ListGroup from 'react-bootstrap/ListGroup';

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

  const deleteFile = async (id) => {
    try {
      await axios.delete(`${config.baseURL}/api/files/${id}`);
      fetchFiles(); // Refresh the files list after deleting a file
      toast.success('Tiedostolinkki poistettu onnistuneesti');
    } catch (err) {
      console.error(err);
      toast.error('Virhe poistettaessa tiedostolinkkiä');
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
      <ListGroup variant="flush">
      {files.map(file => (
        <ListGroup.Item key={file._id} className='bg-white border border-primary mb-2'>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            {file.name}
          </a>
          <br />
          <button onClick={() => deleteFile(file._id)} className='delete-link'>Poista</button>
        </ListGroup.Item>

      ))}
      </ListGroup>
    </div>
  );
};

export default ResearchPage;