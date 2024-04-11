import React, { useState } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const submitFile = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${config.baseURL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <form onSubmit={submitFile}>
      <input type="file" onChange={handleFileUpload} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;