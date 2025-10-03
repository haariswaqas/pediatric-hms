// src/utils/childUtils.js

export const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
  
    const birthDate = new Date(birthDateString);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };
  
  export const calculateBMI = (weight, heightCm) => {
    const weightFloat = parseFloat(weight);
    const heightFloat = parseFloat(heightCm);
  
    if (!weightFloat || !heightFloat || weightFloat <= 0 || heightFloat <= 0) return null;
  
    const heightM = heightFloat / 100;
    const bmi = weightFloat / (heightM * heightM);
  
    return bmi.toFixed(1);
  };
  
  
  
