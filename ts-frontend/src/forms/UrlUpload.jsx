import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../configuration/config.js';
import { toast } from 'react-toastify';

const UrlUpload = ({ propertyId, onUpload }) => { // receive propertyId as a prop
  const [url, setUrl] = useState('');
  const [name, setName] = useState(''); // state for file name
  const formRef = useRef(); // create a ref for the form

  const submitUrl = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('url', url);
    formData.append('name', name); // include the file name in the form data
    formData.append('propertyId', propertyId); // include the property ID in the form data

        // Log the form data
    for (var pair of formData.entries()) {
      console.log(pair[0]+ ', ' + pair[1]); 
    }

    await axios.post(`${config.baseURL}/api/upload`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      },
  })
  .then(() => {
      formRef.current.reset(); // reset the form
      setUrl(''); // clear the url state
      setName(''); // clear the name state
      toast.success('URL lisätty!'); // show a success toast
      onUpload(); // call the onUpload function
  })
  .catch(() => {
      toast.error('URL lisääminen ei onnistunut!'); // show an error toast
  });
};

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <form ref={formRef} onSubmit={submitUrl}>
      <input type="text" className='mb-1' onChange={handleNameChange} placeholder="Lisää tiedoston nimi" />
      <input type="text" className='mb-1' onChange={handleUrlChange} placeholder="Lisää URL" />
      <button type="submit" className='primary-button'>Lisää linkki</button>
    </form>
  );
};

export default UrlUpload;