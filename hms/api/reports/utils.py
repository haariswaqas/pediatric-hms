# api/reports/utils.py
import logging
from datetime import datetime
from enum import Enum, auto
from pathlib import Path
from django.conf import settings
from reportlab.lib import colors
from ..models import User, LabResultParameter, BillItem
from django.db.models import Q 
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

# Constants
class ReportTypeEnum(Enum):
    ADMISSION = auto()
    DISCHARGE = auto()
    PRESCRIPTION_RECORDS = auto()
    ALL_VACCINATION_RECORDS = auto()
    DRUG_DISPENSE_RECORDS = auto()
    LAB_REPORT = auto()
    BILL = auto()

class FileFormat(Enum):
    CSV = "csv"
    XLSX = "xlsx"
    PDF = "pdf"
    # Add other formats as needed

# Create report directory if it doesn't exist
REPORT_DIR = Path(settings.BASE_DIR) / 'generated_reports'
REPORT_DIR.mkdir(exist_ok=True, parents=True)

# Load hospital logo if available or create a placeholder function
def get_logo_path():
    logo_path = Path(settings.BASE_DIR) / 'static' / 'images' / 'hospital_logo.png'
    if logo_path.exists():
        return str(logo_path)
    return None

# Brand colors
class BrandColors:
    PRIMARY = colors.HexColor('#2980b9')     # Blue
    SECONDARY = colors.HexColor('#27ae60')   # Green
    ACCENT = colors.HexColor('#f39c12')      # Orange
    TEXT = colors.HexColor('#2c3e50')        # Dark blue/gray
    LIGHT_BG = colors.HexColor('#ecf0f1')    # Light gray
    TABLE_HEADER = colors.HexColor('#3498db') # Lighter blue
    TABLE_EVEN = colors.HexColor('#f5f7fa')   # Very light blue-gray
    TABLE_ODD = colors.white

# Fetch all admin user emails
def get_default_recipients():
    return list(User.objects.filter(role='admin').values_list('email', flat=True))

def get_pharmacist_recipients():
    return list(User.objects.filter(role='pharmacist').values_list('email', flat=True))

def get_labtech_recipients():
    return list(User.objects.filter(role='lab_tech').values_list('email', flat=True))

def get_requested_by_recipient(parameter_id: int) -> Optional[str]:
    """Get the email of the user who requested the lab result for the given parameter."""
    try:
        parameter = LabResultParameter.objects.select_related(
            'lab_result__lab_request_item__lab_request__requested_by__user'
        ).get(pk=parameter_id)

        return parameter.lab_result.lab_request_item.lab_request.requested_by.user.email
    except LabResultParameter.DoesNotExist:
        logger.warning(f"LabResultParameter with id {parameter_id} does not exist.")
        return None
    except AttributeError:
        logger.warning(f"Requested_by or email not found for parameter id {parameter_id}.")
        return None

def get_parent(bill_number: str) -> Optional[Tuple[int, str]]:
    """
    Get the user ID and email of the child's primary guardian
    based on the bill_number.
    
    Args:
        bill_number (str): The unique number of the Bill.
    
    Returns:
        Tuple of (user_id, email) or None if not found.
    """
    try:
        # Fetch the first BillItem related to the given bill_number
        bill_item = BillItem.objects.select_related(
            'bill__child__primary_guardian__user'
        ).filter(bill__bill_number=bill_number).first()
        
        if not bill_item:
            logger.warning(f"No BillItem found for bill number {bill_number}")
            return None
        
        user = bill_item.bill.child.primary_guardian.user
        return user.id, user.email

    except AttributeError:
        logger.warning(f"Primary guardian or user not found for bill number {bill_number}")
        return None
    
    
    
def get_requested_by_email_for_request(request_id: str) -> Optional[str]:
    """Get the email of the user who requested the lab result for the given request_id."""
    try:
        parameter = LabResultParameter.objects.filter(
            lab_result__lab_request_item__lab_request__request_id=request_id
        ).select_related(
            'lab_result__lab_request_item__lab_request__requested_by__user'
        ).first()
        if parameter:
            return parameter.lab_result.lab_request_item.lab_request.requested_by.user.email
        else:
            logger.warning(f"No LabResultParameter found for request_id: {request_id}.")
            return None
    except AttributeError:
        logger.warning(f"Requested_by or email not found for request_id {request_id}.")
        return None
    except Exception as e:
        logger.error(f"Error retrieving requested_by_email for request_id {request_id}: {e}")
        return None


# Updated utility function to return User object instead of just email
def get_requested_by_user_for_request(request_id: str) -> Optional[object]:
    """Get the User object of the user who requested the lab result for the given request_id."""
    try:
        parameter = LabResultParameter.objects.filter(
            lab_result__lab_request_item__lab_request__request_id=request_id
        ).select_related(
            'lab_result__lab_request_item__lab_request__requested_by__user'
        ).first()
        if parameter:
            return parameter.lab_result.lab_request_item.lab_request.requested_by.user
        else:
            logger.warning(f"No LabResultParameter found for request_id: {request_id}.")
            return None
    except AttributeError:
        logger.warning(f"Requested_by or user not found for request_id {request_id}.")
        return None
    except Exception as e:
        logger.error(f"Error retrieving requested_by_user for request_id {request_id}: {e}")
        return None



def get_doctor_and_nurse_recipients() -> List[User]:
    return list(User.objects.filter(Q(role='doctor') | Q(role='nurse')))

def get_default_users():
    """Get list of admin users who should have access to reports by default"""
    return User.objects.filter(role='admin')

def generate_filename(prefix: str, file_format: str) -> Path:
    """Generate a timestamped filename for reports."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return REPORT_DIR / f"{prefix}_report_{timestamp}.{file_format}"

def get_day_with_suffix(day: int) -> str:
    if 11 <= day <= 13:
        return f"{day}th"
    last_digit = day % 10
    if last_digit == 1:
        return f"{day}st"
    elif last_digit == 2:
        return f"{day}nd"
    elif last_digit == 3:
        return f"{day}rd"
    else:
        return f"{day}th"