from .dynamic_permissions import DynamicRolePermission, IsRoleUser
from .admin_permissions import IsAdminUser
from .shift_permissions import IsMedicalProfessionalUser, IsParentUser
from .doctor_permissions import IsDoctorOrReadOnly
from .diagnosis_permissions import DiagnosisPermission, DiagnosisPermissions, IsDoctorOrLabTechOtherwiseReadOnly
from .prescription_permissions import PrescriptionPermission, PrescriptionItemPermission, IsPrescriberOrReadOnly
from .drug_permissions import IsPharmacistOrReadOnly
from .lab_permissions import *
from .vaccination_record_permissions import *
from .admission_permissions import *
from .child_permissions import *
from .pharmacist_permissions import *
from .billing_permissions import *