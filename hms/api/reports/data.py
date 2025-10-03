# api/reports/data.py
from django.db.models import QuerySet
from .utils import FileFormat, logger, ReportTypeEnum, get_day_with_suffix
from pathlib import Path
import pandas as pd
from .pdf import generate_pdf
from typing import List, Dict, Any, Optional, Tuple

def build_report_data(records: QuerySet, report_type: ReportTypeEnum) -> List[Dict[str, Any]]:
    """
    Single entry point: dispatch to the right builder based on report_type.
    """
    dispatch = {
        ReportTypeEnum.ADMISSION: _build_admission_data,
        ReportTypeEnum.DISCHARGE: _build_discharge_data,
        ReportTypeEnum.ALL_VACCINATION_RECORDS: _build_vaccination_data,
        ReportTypeEnum.PRESCRIPTION_RECORDS: _build_prescription_data, 
        ReportTypeEnum.DRUG_DISPENSE_RECORDS: _build_drug_dispense_data,
        ReportTypeEnum.LAB_REPORT: _build_lab_report_data
        
    }
    try:
        builder = dispatch[report_type]
    except KeyError:
        raise ValueError(f"Unsupported report type: {report_type}")
    return builder(records)


def _build_admission_data(records: QuerySet) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    for r in records:
        row = {
            'Patient': f"{r.child.first_name} {r.child.last_name}",
            'Reason': r.admission_reason,
            'Diagnosis': r.initial_diagnosis,
            'Location': f"{r.bed.bed_number} in {r.bed.ward.name}" if r.bed else 'N/A',
            
           
            'Doctor': f"{r.attending_doctor.first_name} {r.attending_doctor.last_name}"
                      if r.attending_doctor else 'N/A',
            'Admitted On': r.admission_date.strftime('%Y-%m-%d %H:%M'),
            'Discharged On': (r.discharge_date.strftime('%Y-%m-%d %H:%M')
                               if r.discharge_date else 'Still Admitted'),
        }
        data.append(row)
    return data


def _build_discharge_data(records: QuerySet) -> List[Dict[str, Any]]:
    # you could share code with _build_admission_data if desired
    data = _build_admission_data(records)
    # but if discharge report only needs subset, you can remap:
    for row in data:
        # keep only child, discharge date, diagnosis, doctor…
        row_keys = ['Child Name','Diagnosis','Doctor','Discharge Date']
        for k in list(row):
            if k not in row_keys:
                row.pop(k)
    return data


def _build_vaccination_data(records: QuerySet) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    for r in records:
        data.append({
            'Child Name': f"{r.child.first_name} {r.child.last_name}",
            'Vaccine': r.vaccine.name,
            'Dose #': r.dose_number,
            'Scheduled': r.scheduled_date.strftime('%Y-%m-%d'),
            'Administered': (r.administered_date.strftime('%Y-%m-%d')
                             if r.administered_date else 'Pending'),
            'Status': r.status,
            'Batch #': r.batch_number or 'N/A',
            'Notes': r.notes or ''
        })
    return data

def _build_prescription_data(records: QuerySet) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    for r in records:
        data.append({
            'Child Name': f"{r.prescription.child.first_name} {r.prescription.child.last_name}",
            'Drug': f"{r.drug.name} ({r.drug.strength})",
            
            'Dosage': r.dosage,
            'Frequency': r.frequency,
            'Duration': f"{r.duration_value} {r.duration_unit}",
            'Prescribed By': f"Dr. {r.prescription.doctor.first_name} {r.prescription.doctor.last_name}",
            
            
            
        })
    return data

def _build_drug_dispense_data(records: QuerySet) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    for r in records:
        date_obj = r.date_dispensed
        day_with_suffix = get_day_with_suffix(date_obj.day)
        date_dispensed = date_obj.strftime(f"{day_with_suffix} %B, %Y %I:%M %p")

        data.append({
            'Date Dispensed': date_dispensed,
            'Dispensed To': f"{r.prescription_item.prescription.child.first_name} {r.prescription_item.prescription.child.last_name}",
            'Prescribed By': f"Dr. {r.prescription_item.prescription.doctor.first_name} {r.prescription_item.prescription.doctor.last_name}",
            'Dispensed By': f"Dr. {r.pharmacist.first_name} {r.pharmacist.last_name}",
            'Drug Dispensed': f"{r.prescription_item.drug.name} ({r.prescription_item.drug.strength})",
            'Dosage': r.prescription_item.dosage,
            'Frequency': r.prescription_item.get_frequency_display(),
            'Quantity Dispensed': r.quantity_dispensed,
        })
    return data


def _build_lab_report_data(records: QuerySet) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    
    for r in records:
        date_obj = r.lab_result.date_performed
        day_with_suffix = get_day_with_suffix(date_obj.day)
        date_performed = date_obj.strftime(f"{day_with_suffix} %B, %Y %I:%M %p")

        request_id = r.lab_result.lab_request_item.lab_request.request_id
        patient = r.lab_result.lab_request_item.lab_request.child
        doctor = r.lab_result.lab_request_item.lab_request.requested_by
        lab_tech = r.lab_result.performed_by
        lab_test = r.lab_result.lab_request_item.lab_test
        reference_range = str(r.reference_range) if r.reference_range else "N/A"
        parameter_name = r.parameter_name
        value = r.value
        unit = r.unit
        status = r.status

        data.append({
            "Date Performed": date_performed,
            "Request ID": request_id,
            "Patient": f"{patient.first_name} {patient.last_name}",
            "Requested By": f"Dr. {doctor.first_name} {doctor.last_name}",
            "Performed By": f"{lab_tech.first_name} {lab_tech.last_name}" if lab_tech else "N/A",
            "Test": lab_test.name if hasattr(lab_test, "name") else str(lab_test),
            "Parameter Name": parameter_name,
            "Value": value,
            "Unit": unit,
            "Reference Range": reference_range,
            "Status": status,
        })

    return data


        
        


def write_report_file(report_data: List[Dict[str, Any]], filepath: Path, file_format: str) -> Path:
    """
    Write report data to file.

    Args:
        report_data: List of dictionaries with report data
        filepath: Path to save the file
        file_format: Format of the file (csv, xlsx, pdf)
        
    Returns:
        Path of the saved file
    """
    if not report_data:
        raise ValueError("No data provided for report")

    try:
        if file_format == FileFormat.PDF.value:
            generate_pdf(report_data, filepath)
        else:
            # For non-PDF formats, use pandas
            df = pd.DataFrame(report_data)
            
            if file_format == FileFormat.CSV.value:
                df.to_csv(filepath, index=False)
            elif file_format == FileFormat.XLSX.value:
                df.to_excel(filepath, index=False)
            else:
                raise ValueError(f"Unsupported file format: {file_format}")
        
        logger.info(f"Report saved to {filepath}")
        return filepath

    except Exception as e:
        logger.error(f"Failed to write report: {str(e)}")
        raise
