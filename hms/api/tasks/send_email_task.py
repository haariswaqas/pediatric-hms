# api/tasks.py
from celery import shared_task
from mailjet_rest import Client
from django.conf import settings
import os


@shared_task
def send_email_task(subject, message, recipient_list, from_email=None, fail_silently=False, attachments=None):
    print(f"Triggering email task for: {recipient_list}")
    from_email = from_email or settings.DEFAULT_FROM_EMAIL

    try:
        mailjet = Client(auth=(os.environ["MAILJET_API_KEY"], os.environ["MAILJET_SECRET_KEY"]), version="v3.1")

        # Build recipients
        to_list = [{"Email": email} for email in recipient_list]

        # Prepare base message
        msg = {
            "From": {"Email": from_email, "Name": "My App"},
            "To": to_list,
            "Subject": subject,
            "TextPart": message,
            "HTMLPart": f"<p>{message}</p>",
        }

        # Handle attachments if provided
        if attachments:
            msg["Attachments"] = []
            for attachment in attachments:
                try:
                    with open(attachment, "rb") as f:
                        import base64
                        file_content = base64.b64encode(f.read()).decode()
                        msg["Attachments"].append(
                            {
                                "ContentType": "application/octet-stream",
                                "Filename": attachment.split("/")[-1],
                                "Base64Content": file_content,
                            }
                        )
                except Exception as e:
                    print(f"Failed to attach {attachment}: {e}")

        # Send email
        data = {"Messages": [msg]}
        result = mailjet.send.create(data=data)

        if result.status_code == 200:
            print(f"Email sent successfully to: {recipient_list}")
        else:
            print(f"Mailjet error: {result.status_code}, {result.json()}")

    except Exception as e:
        if not fail_silently:
            raise
        print(f"Error sending email: {e}")
