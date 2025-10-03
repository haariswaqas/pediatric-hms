from rest_framework import generics, status, views
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from ..models import User, OTP
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views import View
from django.core.signing import Signer, BadSignature
from django.core.exceptions import ObjectDoesNotExist
from ..serializers import RegisterSerializer, LoginSerializer, OTPVerificationSerializer
from ..tasks import send_email_task
import urllib.parse

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        # Default role set to 'Parent' if not specified
        role = self.request.data.get('role', 'Admin')
        
        # Grab the license_document file from request.FILES (if any)
        license_doc = self.request.FILES.get('license_document', None)

        # Pass both 'role' and 'license_document' into serializer.save()
        # so they're set on the User before the post_save signal fires
        user = serializer.save(role=role, license_document=license_doc)



class OTPVerificationView(views.APIView):
    def post(self, request, *args, **kwargs):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_input = serializer.validated_data['otp']

            try:
                user = User.objects.get(email=email)
                otp_obj = OTP.objects.get(user=user)
            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({"detail": "Invalid email or OTP."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_obj.is_expired():
                return Response({"detail": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_obj.code == otp_input:
                otp_obj.is_verified = True
                otp_obj.save()
                return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp_obj = OTP.objects.get(user=user)

            if otp_obj.is_verified:
                return Response({"detail": "Email already verified."}, status=status.HTTP_400_BAD_REQUEST)

            subject = "Resend: Verify Your Email for Hospital Portal!"
            message = (
                f"Dear {user.username},\n\n"
                "Here's your OTP to verify your email address:\n\n"
                f"Your OTP is: {otp_obj.code}\n\n"
                "Best regards,\nHospital Admin"
            )

            send_email_task.delay(subject, message, [user.email])
            return Response({"detail": "OTP has been resent."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"detail": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({"detail": "No OTP found for this user."}, status=status.HTTP_404_NOT_FOUND)
