import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const formRef = useRef(); // create a ref for the form

  const submitFile = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${config.baseURL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    .then(() => {
        formRef.current.reset(); // reset the form
        setFile(null); // clear the file state
        toast.success('File uploaded!'); // show a success toast
    })
    .catch(() => {
        toast.error('File upload failed!'); // show an error toast
    });
  };

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <form ref={formRef} onSubmit={submitFile}>
      <input type="file" onChange={handleFileUpload} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;