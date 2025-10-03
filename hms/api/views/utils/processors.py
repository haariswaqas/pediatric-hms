import pandas as pd
import datetime
from decimal import Decimal
from ...models import User, ParentProfile
from django.db import transaction

def parse_bool(val):
    if isinstance(val, bool):
        return val
    text = str(val).strip().lower()
    return text in ('true', '1', 'yes', 'y')


def parse_date(val):
    if not val:
        return None
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.date() if isinstance(val, datetime.datetime) else val
    try:
        return pd.to_datetime(val).date()
    except Exception:
        return None


def format_decimal(val, places=2):
    if val in (None, ''):
        return None
    return Decimal(f"{float(val):.{places}f}")



def process_excel_file(excel_file, field_processors, serializer_class):
    try:
        df = pd.read_excel(excel_file)
    except Exception as e:
        raise ValueError(f"Could not parse Excel file: {e}")

    successes, errors = [], []
    with transaction.atomic():
        for idx, row in enumerate(df.fillna('').to_dict(orient='records'), start=1):
            data = {field: proc(row) for field, proc in field_processors.items()}
            serializer = serializer_class(data=data)
            if serializer.is_valid():
                successes.append(serializer.save())
            else:
                errors.append({'row': idx, 'errors': serializer.errors})
    return successes, errors



def process_excel_file_for_child(excel_file, field_processors, serializer_class):
    """
    Updated to work with both old and new processor signatures
    """
    try:
        df = pd.read_excel(excel_file)
        print(f"DEBUG: Successfully read Excel file with {len(df)} rows")
        print(f"DEBUG: Column names: {list(df.columns)}")
    except Exception as e:
        raise ValueError(f"Could not parse Excel file: {e}")

    successes, errors = [], []
    
    # Debug: Show first few raw rows
    print("DEBUG: First 2 raw rows from Excel:")
    for i, row in enumerate(df.head(2).to_dict(orient='records')):
        print(f"  Row {i+1}: {row}")
    
    with transaction.atomic():
        for idx, row in enumerate(df.fillna('').to_dict(orient='records'), start=1):
            print(f"\nDEBUG: Processing row {idx}")
            try:
                data = {}
                for field_name, processor in field_processors.items():
                    if field_name in row:
                        try:
                            # Check if processor expects field_name argument
                            import inspect
                            sig = inspect.signature(processor)
                            if len(sig.parameters) == 2:
                                # New style processor (value, field_name)
                                processed_value = processor(row[field_name], field_name)
                                data[field_name] = processed_value
                                print(f"DEBUG:   {field_name}: '{row[field_name]}' -> {processed_value}")
                            else:
                                # Old style processor (row)
                                processed_value = processor(row)
                                data[field_name] = processed_value
                                print(f"DEBUG:   {field_name}: (old style) -> {processed_value}")
                        except Exception as field_error:
                            print(f"DEBUG:   ERROR processing {field_name}: {str(field_error)}")
                            raise ValueError(f"Field '{field_name}': {str(field_error)}")
                
                print(f"DEBUG: Final processed data: {data}")
                
                serializer = serializer_class(data=data)
                if serializer.is_valid():
                    saved_obj = serializer.save()
                    successes.append(saved_obj)
                    print(f"DEBUG: ✓ Row {idx} saved successfully")
                else:
                    print(f"DEBUG: ✗ Row {idx} validation failed:")
                    for field, field_errors in serializer.errors.items():
                        print(f"DEBUG:     {field}: {field_errors}")
                    
                    errors.append({
                        'row': idx, 
                        'errors': serializer.errors,
                        'data_preview': {k: str(v)[:50] for k, v in data.items() if v is not None}
                    })
                    
            except ValueError as row_error:
                print(f"DEBUG: ✗ Row {idx} processing error: {str(row_error)}")
                errors.append({
                    'row': idx,
                    'errors': {'processing': [str(row_error)]},
                    'raw_data': {k: str(v)[:50] for k, v in row.items() if v}
                })
            except Exception as unexpected_error:
                print(f"DEBUG: ✗ Row {idx} unexpected error: {str(unexpected_error)}")
                errors.append({
                    'row': idx,
                    'errors': {'unexpected': [f"Unexpected error: {str(unexpected_error)}"]},
                    'raw_data': {k: str(v)[:50] for k, v in row.items() if v}
                })
    
    print(f"\nDEBUG: Final results - Successes: {len(successes)}, Errors: {len(errors)}")
    return successes, errors


# ---------------------------------------------------------------------
def process_guardian_field(value, field_name):
    """
    Process guardian fields by looking up ParentProfile using email or username
    """
    if not value or pd.isna(value) or str(value).strip() == '':
        return None
    
    value = str(value).strip()
    
    try:
        # First try by email if it looks like an email
        if '@' in value and '.' in value:
            user = User.objects.get(email=value, role=User.PARENT)
        else:
            # Try by username
            user = User.objects.get(username=value, role=User.PARENT)
        
        # Get the ParentProfile associated with this user
        parent_profile = ParentProfile.objects.get(user=user)
        return parent_profile.id
        
    except User.DoesNotExist:
        raise ValueError(f"Parent user with email/username '{value}' not found for {field_name}")
    except ParentProfile.DoesNotExist:
        raise ValueError(f"ParentProfile not found for user '{value}' in {field_name}")
    except User.MultipleObjectsReturned:
        raise ValueError(f"Multiple parent users found with identifier '{value}' for {field_name}")

def process_text_field(value, field_name):
    """Process basic text fields"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    return str(value).strip()

def process_decimal_field(value, field_name):
    """Process decimal fields like weight, height, BMI"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    try:
        return Decimal(str(value))
    except (ValueError, TypeError):
        raise ValueError(f"Invalid decimal value '{value}' for {field_name}")

def process_integer_field(value, field_name):
    """Process integer fields like age"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    try:
        return int(float(value))  # float first to handle decimal inputs
    except (ValueError, TypeError):
        raise ValueError(f"Invalid integer value '{value}' for {field_name}")

def process_date_field(value, field_name):
    """Process date fields like date_of_birth"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    
    # If it's already a datetime object (from pandas)
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.date()
    
    # Try to parse string dates
    try:
        # Try common date formats
        for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
            try:
                return datetime.strptime(str(value), fmt).date()
            except ValueError:
                continue
        raise ValueError(f"Could not parse date format for {field_name}")
    except Exception:
        raise ValueError(f"Invalid date value '{value}' for {field_name}")

def process_email_field(value, field_name):
    """Process email fields with validation"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    
    email = str(value).strip()
    if '@' not in email or '.' not in email:
        raise ValueError(f"Invalid email format '{email}' for {field_name}")
    return email

def process_choice_field(value, field_name, choices_dict):
    """Process choice fields with validation"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    
    value = str(value).strip()
    # Check if value matches any choice key or value
    for key, display in choices_dict:
        if value.lower() in [key.lower(), display.lower()]:
            return key
    
    valid_choices = [f"{key} ({display})" for key, display in choices_dict]
    raise ValueError(f"Invalid choice '{value}' for {field_name}. Valid choices: {', '.join(valid_choices)}")


def process_boolean_field(value, field_name):
    """Process boolean fields like is_active, requires_fasting"""
    if pd.isna(value) or str(value).strip() == '':
        return False  # Default to False for empty values
    
    # If it's already a boolean
    if isinstance(value, bool):
        return value
    
    # Convert string representations to boolean
    str_value = str(value).strip().lower()
    
    # True values
    if str_value in ['true', 't', 'yes', 'y', '1', 'on', 'active', 'enabled']:
        return True
    
    # False values
    if str_value in ['false', 'f', 'no', 'n', '0', 'off', 'inactive', 'disabled']:
        return False
    
    # Try to convert numeric values
    try:
        numeric_value = float(str_value)
        return bool(numeric_value)
    except ValueError:
        pass
    
    raise ValueError(f"Invalid boolean value '{value}' for {field_name}. Expected: True/False, Yes/No, 1/0, etc.")


def process_datetime_field(value, field_name):
    """Process datetime fields like created_at, updated_at"""
    if pd.isna(value) or str(value).strip() == '':
        return None
    
    # If it's already a datetime object
    if isinstance(value, (pd.Timestamp, datetime)):
        return value
    
    # Try to parse string datetimes
    try:
        # Try common datetime formats
        datetime_formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M:%S.%f',
            '%d/%m/%Y %H:%M:%S',
            '%m/%d/%Y %H:%M:%S',
            '%d-%m-%Y %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%d/%m/%Y %H:%M',
            '%m/%d/%Y %H:%M',
            '%d-%m-%Y %H:%M',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%dT%H:%M:%S.%fZ',
        ]
        
        for fmt in datetime_formats:
            try:
                return datetime.strptime(str(value), fmt)
            except ValueError:
                continue
        
        # If no format matches, try pandas to_datetime as fallback
        return pd.to_datetime(value)
        
    except Exception:
        raise ValueError(f"Invalid datetime value '{value}' for {field_name}. Expected formats: YYYY-MM-DD HH:MM:SS, etc.")
    


def process_foreign_key_field(value, field_name, model_class=None, lookup_field='pk'):
    """
    Process foreign key fields by looking up the related object
    
    Args:
        value: The value to lookup (could be ID, code, name, etc.)
        field_name: Name of the field being processed
        model_class: The model class to lookup (e.g., LabTest)
        lookup_field: The field to use for lookup (default: 'pk', could be 'code', 'name', etc.)
    """
    if pd.isna(value) or str(value).strip() == '':
        return None
    
    if model_class is None:
        raise ValueError(f"Model class must be specified for foreign key field {field_name}")
    
    try:
        # Clean the value
        lookup_value = str(value).strip()
        
        # Try to convert to appropriate type based on lookup_field
        if lookup_field == 'pk' or lookup_field == 'id':
            try:
                lookup_value = int(lookup_value)
            except ValueError:
                raise ValueError(f"Invalid ID '{lookup_value}' for {field_name}")
        
        # Create the lookup dictionary
        lookup_dict = {lookup_field: lookup_value}
        
        # Try to get the object
        try:
            obj = model_class.objects.get(**lookup_dict)
            return obj
        except model_class.DoesNotExist:
            raise ValueError(f"No {model_class.__name__} found with {lookup_field}='{lookup_value}' for {field_name}")
        except model_class.MultipleObjectsReturned:
            raise ValueError(f"Multiple {model_class.__name__} objects found with {lookup_field}='{lookup_value}' for {field_name}")
            
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Error processing foreign key field {field_name}: {str(e)}")

def process_lab_test_foreign_key(value, field_name):
    if pd.isna(value) or not str(value).strip():
        return None
    return str(value).strip()

