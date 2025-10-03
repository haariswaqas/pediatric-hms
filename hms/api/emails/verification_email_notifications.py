from ..models import User, OTP, Child
from ..tasks import send_email_task, create_system_log_task
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.signing import Signer
import urllib.parse
import sys

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    # Avoid sending emails during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    # Skip sending an email if the user was created by the admin,
    # because the email has been handled in perform_create.
    if created and getattr(instance, 'created_by_admin', False):
        return

    if created and not instance.is_superuser:
        # Self-registration: generate and send OTP
        otp_obj, otp_created = OTP.objects.get_or_create(user=instance)
        if otp_created or not otp_obj.is_verified:
            otp_code = OTP.generate_otp()
            otp_obj.code = otp_code
            otp_obj.save()

            subject = "Welcome to the Hospital Portal! Verify Your Email!"
            message = (
                f"Dear {instance.username},\n\n"
                "Welcome! Before you can log in, please verify your email address.\n\n"
                f"Your OTP is: {otp_code}\n\n"
                "Best regards,\nHospital Admin"
            )
            send_email_task.delay(subject, message, [instance.email])
            create_system_log_task.delay(
                level='INFO',
                message=f"OTP generated and welcome email sent to {instance.email}.",
                user_id=instance.id
            )


# this email will be sent when the user wants to self-register as a medical professional
# (basically, when user.role is not parent). a verification url will be sent to all the admins on the system 
#and the admin will have to click on the url before the user can login..
# the user will still go through the otp process, but the admin will still 
# have to verify the user via tapping the link they receive in their email

@receiver(post_save, sender=User)
def verify_medical_professional_by_admin(sender, instance, created, **kwargs):
    if created and instance.role != User.PARENT and instance.created_by_admin==False:
        signer = Signer()
        token = signer.sign(instance.pk)
        token_encoded = urllib.parse.quote(token, safe='')
        verification_url = f"https://062c-41-204-44-21.ngrok-free.app/api/verify-medical-professional/{instance.pk}/{token_encoded}/"
        
        subject = f"New {instance.role} Verification Request"
        message = (
            f"A new {instance.role} has registered:\n\n"
            f"Username: {instance.username}\n"
            f"Email: {instance.email}\n\n"
            f"To manually verify this {instance.role}, please click the link below:\n"
            f"{verification_url}\n\n"
            "If you did not expect this request, please ignore this email."
        )

        # Collect admin emails
        admin_emails = list(User.objects.filter(role=User.ADMIN).values_list('email', flat=True))
        if admin_emails:
            # If a license_document exists, attach it
            if instance.license_document:
                print("DEBUG license_document:", instance.license_document)
                print("DEBUG license_document path:", instance.license_document.path)
                
                send_email_task.delay(
                    subject=subject,
                    message=message,
                    recipient_list=admin_emails,
                    attachments=[instance.license_document.path]  # Pass a list of file paths
                )
            else:
                # No license_document, send without attachments
                send_email_task.delay(
                    subject=subject,
                    message=message,
                    recipient_list=admin_emails
                )
                create_system_log_task.delay(
                level='INFO',
                message=f"A verification email for {instance.role} {instance.email} was sent to admins.",
                user_id=instance.id
            )

        

