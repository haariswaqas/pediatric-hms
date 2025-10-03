from .auth_urls import urlpatterns as auth_urls
from .logging_urls import urlpatterns as logging_urls
from .report_urls import urlpatterns as report_urls
from .profile_urls import urlpatterns as profile_urls
from .admin_urls import urlpatterns as admin_urls
from .password_reset_urls import urlpatterns as password_reset_urls
from .email_verification_urls import urlpatterns as email_verification_urls
from .child_urls import urlpatterns as child_urls
from .chatbot_urls import urlpatterns as chatbot_urls
from .tracking_urls import urlpatterns as tracking_urls
from .visualization_urls import urlpatterns as visualization_urls
from .hospital_urls import urlpatterns as hospital_urls
from .shift_urls import urlpatterns as shift_urls
from .notification_urls import urlpatterns as notification_urls
from .appointment_urls import urlpatterns as appointment_urls
from .vaccination_urls import urlpatterns as vaccination_urls
from .admission_urls import urlpatterns as admission_urls
from .diagnosis_urls import urlpatterns as diagnosis_urls
from .drug_urls import urlpatterns as drug_urls
from .prescription_urls import urlpatterns as prescription_urls
from .scheduler_urls import urlpatterns as scheduler_urls
from .lab_urls import urlpatterns as lab_urls
from .lab_request_urls import urlpatterns as lab_request_urls
from .lab_result_urls import urlpatterns as lab_result_urls
from .billing_urls import urlpatterns as billing_urls

# Combine all urlpatterns
urlpatterns = (
    auth_urls +
    logging_urls +
    email_verification_urls +
    profile_urls +
    admin_urls +
    password_reset_urls +
    child_urls + chatbot_urls +
    tracking_urls +
    visualization_urls +
    hospital_urls +
    shift_urls +
    notification_urls +
    appointment_urls +
    vaccination_urls +
    admission_urls + diagnosis_urls + drug_urls
    + prescription_urls + 
    scheduler_urls + report_urls + 
    lab_urls + lab_request_urls + lab_result_urls +
    billing_urls
    
)
