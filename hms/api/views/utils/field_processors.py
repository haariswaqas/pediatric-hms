# utils/field_processors.py
from .processors import (
parse_bool, parse_date, format_decimal, process_guardian_field, 
process_text_field, process_decimal_field, process_date_field,
process_choice_field, process_integer_field, process_email_field, 

process_boolean_field, process_lab_test_foreign_key
)

# Mapping for Drug model bulk-upload
DRUG_FIELD_PROCESSORS = {
    'name':                         lambda r: r.get('name'),
    'generic_name':                 lambda r: r.get('generic_name'),
    'brand_name':                   lambda r: r.get('brand_name'),
    'description':                  lambda r: r.get('description'),
    'ndc_code':                     lambda r: r.get('ndc_code'),
    'category':                     lambda r: r.get('category'),
    'dosage_form':                  lambda r: r.get('dosage_form'),
    'route':                        lambda r: r.get('route'),
    'strength':                     lambda r: r.get('strength'),
    'concentration':                lambda r: r.get('concentration'),
    'manufacturer':                 lambda r: r.get('manufacturer'),
    'price_per_unit':               lambda r: format_decimal(r.get('price_per_unit')),
    'quantity_in_stock':            lambda r: int(r.get('quantity_in_stock') or 0),
    'reorder_level':                lambda r: int(r.get('reorder_level') or 0),
    'is_available':                 lambda r: parse_bool(r.get('is_available')),
    'batch_number':                 lambda r: r.get('batch_number'),
    'expiration_date':              lambda r: parse_date(r.get('expiration_date')),
    'requires_weight_based_dosing': lambda r: parse_bool(r.get('requires_weight_based_dosing')),
    'minimum_age_months':           lambda r: int(r.get('minimum_age_months')) if r.get('minimum_age_months') else None,
    'maximum_age_months':           lambda r: int(r.get('maximum_age_months')) if r.get('maximum_age_months') else None,
    'minimum_weight_kg':            lambda r: format_decimal(r.get('minimum_weight_kg')),
    'pediatric_notes':              lambda r: r.get('pediatric_notes'),
    'special_storage':              lambda r: r.get('special_storage'),
    'controlled_substance':         lambda r: parse_bool(r.get('controlled_substance')),
    'controlled_substance_class':   lambda r: r.get('controlled_substance_class'),
}


# Define your field processors for Child model
CHILD_FIELD_PROCESSORS = {
    # Guardian fields
    'primary_guardian': process_guardian_field,
    'secondary_guardian': process_guardian_field,
    'relationship_to_primary_guardian': process_text_field,
    'relationship_to_secondary_guardian': process_text_field,
    
    # Basic information
    'first_name': process_text_field,
    'middle_name': process_text_field,
    'last_name': process_text_field,
    'date_of_birth': process_date_field,
    'age': process_integer_field,
    'gender': lambda value, field_name: process_choice_field(value, field_name, [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]),
    'email': process_email_field,
    
    # Health information
    'blood_group': lambda value, field_name: process_choice_field(value, field_name, [
        ('A+', 'A Positive'), ('A-', 'A Negative'), ('B+', 'B Positive'), ('B-', 'B Negative'),
        ('O+', 'O Positive'), ('O-', 'O Negative'), ('AB+', 'AB Positive'), ('AB-', 'AB Negative')
    ]),
    'birth_weight': process_decimal_field,
    'birth_height': process_decimal_field,
    'current_weight': process_decimal_field,
    'current_height': process_decimal_field,
    'current_bmi': process_decimal_field,
    'current_bmi_interpretation': process_text_field,
    'allergies': process_text_field,
    'chronic_conditions': process_text_field,
    'current_medications': process_text_field,
    'vaccination_status': process_text_field,
    
    # Education information
    'school': process_text_field,
    'grade': process_text_field,
    'teacher_name': process_text_field,
    'school_phone': process_text_field,
    
    # Emergency information
    'emergency_contact_name': process_text_field,
    'emergency_contact_phone': process_text_field,
    'emergency_contact_relationship': process_text_field,
    
    # Insurance information
    'insurance_provider': process_text_field,
    'insurance_id': process_text_field,
    
    # Medical history
    'medical_history': process_text_field,
    'surgical_history': process_text_field,
    'family_medical_history': process_text_field,
    'developmental_notes': process_text_field,
    'special_needs': process_text_field,
}


LAB_TEST_FIELD_PROCESSORS = {
    # Basic test information
    'code': process_text_field,
    'name': process_text_field,
    'category': process_text_field,
    'description': process_text_field,
    
    # Sample information
    'sample_type': lambda value, field_name: process_choice_field(value, field_name, [
        ('BLOOD', 'Blood'), ('URINE', 'Urine'), ('STOOL', 'Stool'), 
        ('CSF', 'Cerebrospinal Fluid'), ('SWAB', 'Swab'), ('TISSUE', 'Tissue'),
        ('SPUTUM', 'Sputum'), ('OTHER', 'Other')
    ]),
    'sample_volume_required': process_text_field,
    'preparation_instructions': process_text_field,
    'collection_instructions': process_text_field,
    
    # Test processing and pricing
    'processing_time': process_integer_field,
    'price': process_decimal_field,
    
    # Boolean fields
    'is_active': process_boolean_field,
    'requires_fasting': process_boolean_field,
    
    # Additional instructions
    'special_instructions': process_text_field,
    
    # Pediatric-specific fields
    'minimum_age_months': process_integer_field,
    'maximum_age_months': process_integer_field,
    'pediatric_considerations': process_text_field,
 
}


REFERENCE_RANGE_FIELD_PROCESSORS = {
    # Foreign key relationship - use specific processor
    'lab_test': process_lab_test_foreign_key,  # This will lookup LabTest by code
    
    
    # Range identification
    'parameter_name': process_text_field,
    
    # Age range
    'min_age_months': process_integer_field,
    'max_age_months': process_integer_field,
    
    # Gender specification
    'gender': lambda value, field_name: process_choice_field(value, field_name, [
        ('M', 'Male'), ('F', 'Female'), ('ALL', 'All')
    ]),
    
    # Numeric ranges
    'min_value': process_decimal_field,
    'max_value': process_decimal_field,
    'unit': process_text_field,
    
    # Qualitative ranges
    'textual_reference': process_text_field,
    
    # Additional information
    'notes': process_text_field,
}