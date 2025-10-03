import { useState } from "react";

export const useChildData = () => {
  const [childData, setChildData] = useState({
    primary_guardian: '',
    secondary_guardian: '',
    relationship_to_primary_guardian: '',
    relationship_to_secondary_guardian: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    profile_picture: null,
    date_of_birth: '',
    gender: 'M',
    email: '',
    blood_group: '',
    birth_weight: '',
    birth_height: '',
    current_weight: '',
    current_height: '',
    allergies: '',
    current_medications: '',
    vaccination_status: '',
    school: '',
    grade: '',
    teacher_name: '',
    school_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    insurance_provider: '',
    insurance_id: '',
    chronic_conditions: '',
    medical_history: '',
    surgical_history: '',
    family_medical_history: '',
    developmental_notes: '',
    special_needs: '',
  });

  return [childData, setChildData];
};
