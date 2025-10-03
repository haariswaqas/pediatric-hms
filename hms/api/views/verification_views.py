from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views import View
from django.core.signing import Signer, BadSignature
from ..models import User
from ..tasks import send_email_task
import urllib.parse


class VerifyMedicalProfessionalView(View):
    """
    A class-based view that verifies a medical professional when an admin clicks the verification link.
    """

    def get(self, request, user_id, token):
        # URL-decode the token
        token_decoded = urllib.parse.unquote(token)
        signer = Signer()

        # Step 1: Unsign and verify token
        try:
            signed_pk = signer.unsign(token_decoded)
            if str(user_id) != str(signed_pk):
                return HttpResponse("Invalid verification link.", status=400)
        except BadSignature:
            return HttpResponse("Invalid or expired token.", status=400)

        # Step 2: Retrieve the user and ensure they're not a parent
        user = get_object_or_404(User, pk=user_id)
        if user.role == User.PARENT:
            return HttpResponse("This user is not a medical professional.", status=400)

        # Step 3: Mark user as verified by admin
        # (You mentioned `created_by_admin` previously, but you might want a separate
        # field like `is_verified_by_admin = True` if you prefer a more explicit naming.)
        user.created_by_admin = True
        user.save()

        # Step 4: Send confirmation email to the newly verified user
        subject = "Your Account Has Been Verified by Admin"
        message = (
            f"Dear {user.username},\n\n"
            "Your account has been verified by an admin. "
            "You may now log in and access all functionalities related to your role.\n\n"
            "Best regards,\nHospital Admin"
        )
        send_email_task.delay(subject, message, [user.email])

        return HttpResponse("User has been verified successfully. A confirmation email has been sent.")