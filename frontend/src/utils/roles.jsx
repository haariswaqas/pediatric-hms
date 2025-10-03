// src/utils/roles.js

export const isRole = (user, role) => {
    return user?.role === role;
  };
  
  export const hasAnyRole = (user, roles = []) => {
    return roles.includes(user?.role);
  };
  
  // === Role-specific helper functions ===
  
  export const isAdmin = (user) => {
    switch (user?.role) {
      case 'admin':
        return true;
      default:
        return false;
    }
  };
  
  export const isDoctor = (user) => {
    switch (user?.role) {
      case 'doctor':
        return true;
      default:
        return false;
    }
  };
  
  export const isNurse = (user) => {
    switch (user?.role) {
      case 'nurse':
        return true;
      default:
        return false;
    }
  };
  
  export const isPharmacist = (user) => {
    switch (user?.role) {
      case 'pharmacist':
        return true;
      default:
        return false;
    }
  };
  
  export const isLabTech = (user) => {
    switch (user?.role) {
      case 'lab_tech':
        return true;
      default:
        return false;
    }
  };
  

  export const isParent = (user) => {
    switch (user?.role) {
      case 'parent':
        return true;
      default:
        return false;
    }
  };
  
