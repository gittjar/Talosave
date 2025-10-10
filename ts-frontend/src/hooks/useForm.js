// hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const validateField = useCallback((name, value, rules = {}) => {
    let error = null;

    if (rules.required && (!value || value.toString().trim() === '')) {
      error = `${name} on pakollinen`;
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `${name} tulee olla vähintään ${rules.minLength} merkkiä`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `${name} saa olla enintään ${rules.maxLength} merkkiä`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.message || `${name} ei ole oikeassa muodossa`;
    } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Sähköpostiosoite ei ole oikeassa muodossa';
    }

    setFieldError(name, error);
    return error === null;
  }, [setFieldError]);

  const validateForm = useCallback((validationRules = {}) => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const fieldValue = values[fieldName];
      const rules = validationRules[fieldName];
      
      if (!validateField(fieldName, fieldValue, rules)) {
        isValid = false;
      }
    });

    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(async (e, validationRules = {}) => {
    if (e) e.preventDefault();
    
    if (!validateForm(validationRules)) {
      return false;
    }

    if (onSubmit) {
      setLoading(true);
      try {
        await onSubmit(values);
        return true;
      } catch (error) {
        console.error('Form submission error:', error);
        return false;
      } finally {
        setLoading(false);
      }
    }
    
    return true;
  }, [values, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setLoading(false);
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    reset,
    clearErrors
  };
};